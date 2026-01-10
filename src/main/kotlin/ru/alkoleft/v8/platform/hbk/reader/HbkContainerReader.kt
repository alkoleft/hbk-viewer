/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

// За основу взято https://github.com/1c-syntax/bsl-context/blob/rnd/src/main/java/com/github/_1c_syntax/bsl/context/platform/hbk/HbkContainerExtractor.java
package ru.alkoleft.v8.platform.hbk.reader

import io.github.oshai.kotlinlogging.KotlinLogging
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import java.nio.charset.StandardCharsets
import java.nio.file.Path
import kotlin.math.min

private const val BYTES_BY_FILE_INFOS = 12 // int * 4

private val log = KotlinLogging.logger { }

/**
 * Извлекает содержимое из HBK (Help Book) контейнеров платформы 1С:Предприятие.
 *
 * Этот класс отвечает за чтение и разбор структуры HBK файлов, которые содержат
 * сжатую документацию платформы 1С:Предприятие. HBK файлы представляют собой
 * бинарные контейнеры с определенной структурой заголовков и блоков данных.
 *
 * Основные возможности:
 * - Чтение структуры HBK файла и извлечение метаданных
 * - Получение списка всех сущностей (файлов) в контейнере
 * - Извлечение содержимого конкретных сущностей по имени
 * - Работа с бинарными буферами в little-endian порядке
 *
 * @see HbkContentReader для работы с извлеченным содержимым
 * @see ru.alkoleft.v8.platform.hbk.PlatformContextReader для полного процесса чтения контекста платформы
 */
class HbkContainerReader {
    /**
     * Область видимости для работы с сущностями HBK контейнера.
     *
     * Предоставляет доступ к извлеченным сущностям и буферу данных.
     *
     * @property entities Карта имен сущностей к их адресам в буфере
     * @property buffer Буфер с данными HBK файла
     */
    inner class EntitiesScope(
        val entities: Map<String, Int>,
        val buffer: MappedByteBuffer,
    ) {
        /**
         * Получает содержимое сущности по имени.
         *
         * @param name Имя сущности в HBK контейнере
         * @return Массив байтов с содержимым сущности или null, если сущность не найдена
         */
        fun getEntity(name: String): ByteArray? = entities[name]?.let { getHbkFileBody(buffer, it) }
    }

    fun <T> readHbk(
        path: Path,
        block: EntitiesScope.() -> T,
    ): T {
        if (!path.toFile().exists()) {
            throw IllegalArgumentException("Hbk-file not exists")
        }
        FileInputStream(path.toFile()).use { stream ->
            val channel = stream.channel
            val buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size())

            val entities = entities(buffer)
            entities.forEach { log.warn { "Entry: $it" } }
            return EntitiesScope(entities, buffer).let(block)
        }
    }

    private fun entities(buffer: ByteBuffer): Map<String, Int> {
        val result = mutableMapOf<String, Int>()
        buffer.order(ByteOrder.LITTLE_ENDIAN)

        readContainerHeader(buffer)
        val containerTocBlock = readBlockHeader(buffer)
//        // заголовок блока
//        skipBlock(buffer, 2) // short CRLF
//        val payloadSize = getLongString(buffer)
//        val blockSize = getLongString(buffer)
//        skipBlock(buffer, 11) // long + byte + short

        val position = buffer.position()

        val fileInfos = readBlock(buffer, containerTocBlock)

        buffer.position(position + containerTocBlock.blockSize)

        val remainingBuffer = ByteBuffer.wrap(fileInfos).order(ByteOrder.LITTLE_ENDIAN)
        val count = remainingBuffer.capacity() / BYTES_BY_FILE_INFOS

        // 559
        for (i in 1..count) {
            val headerAddress = remainingBuffer.int
            val bodyAddress = remainingBuffer.int
            val reserved = remainingBuffer.int
            if (reserved != Int.MAX_VALUE) {
                throw RuntimeException()
            }

            val name = getHbkFileName(buffer, headerAddress)
            result[name] = bodyAddress
        }
        return result.toMap()
    }

    private fun readContainerHeader(buffer: ByteBuffer) {
        // Адрес первого свободного блока INT32 (4 байта) Смещение, по которому начинается цепочка свободных блоков
        //
        // Размер блока по умолчанию INT32 (4 байта) Блок может иметь произвольную длину, но значение по умолчанию можно использовать для добавления новых блоков, например.
        //
        // Поле неизвестного назначения INT32 (4 байта)
        // Число, отражающее некоторую величину, как правило, совпадающую с количеством файлов в контейнере, однако, коллеги в комментариях считают, что это не совсем так. На алгоритм интерпретации контейнера данное число никак не влияет, его можно игнорировать.
        //
        // Зарезервированное поле INT32 (4 байта) Всегда равно 0 (всегда ли?)
        log.warn { "Адрес первого свободного блока: ${buffer.int}" }
        log.warn { "Размер блока по умолчанию: ${buffer.int}" }
        log.warn { "Поле неизвестного назначения: ${buffer.int}" }
        log.warn { "Зарезервированное поле: ${buffer.int}" }
        // skipBlock(buffer, 16) // int * 4
    }

    private fun readBlockHeader(buffer: ByteBuffer): Block {
        // заголовок блока
        skipBlock(buffer, 2) // CRLF
        val payloadSize = getLongString(buffer)
        buffer.get() // Пробел
        val blockSize = getLongString(buffer)
        buffer.get() // Пробел
        val nextBlock = getLongString(buffer)
        skipBlock(buffer, 1) // Пробел
        skipBlock(buffer, 2) // CRLF
        return Block(payloadSize, blockSize, nextBlock).also {
            log.warn { "Block: $it" }
        }
    }

    private fun readBlock(
        buffer: ByteBuffer,
        block: Block,
    ): ByteArray {
        val fileInfos = ByteArray(block.payloadSize)
        var currentBlock = block
        var blockOffset = 0
        do {
            val length = min(currentBlock.blockSize, block.payloadSize - blockOffset)
            log.warn { "Read block chunk. Length = $length" }
            buffer.get(fileInfos, blockOffset, length)
            blockOffset += length
            if (currentBlock.hasNextBlock) {
                buffer.position(currentBlock.nextBlockPosition)
                currentBlock = readBlockHeader(buffer)
            } else {
                break
            }
        } while (true)

        return fileInfos
    }

    data class Block(
        val payloadSize: Int,
        val blockSize: Int,
        val nextBlockPosition: Int = Int.MAX_VALUE,
    ) {
        val hasNextBlock: Boolean
            get() = nextBlockPosition != Int.MAX_VALUE
    }

    private fun getHbkFileName(
        buffer: ByteBuffer,
        headerAddress: Int,
    ): String {
        buffer.position(headerAddress)

        skipBlock(buffer, 2)
        val payloadSize = getLongString(buffer) // + 8 + 1
        buffer.get() // Пробел
        skipBlock(buffer, 40) // 8 + 1 + 8 + 1 + 2 + 8 + 8 + 4

        val stringArray = ByteArray(payloadSize - 24) // int * 6, которые пропускаем
        buffer.get(stringArray)

        return String(stringArray, StandardCharsets.UTF_16LE)
    }

    private fun getHbkFileBody(
        buffer: ByteBuffer,
        bodyAddress: Int,
    ): ByteArray {
        buffer.position(bodyAddress)

        val block = readBlockHeader(buffer)
        val blockData = readBlock(buffer, block)

        return blockData
    }

    private fun getLongString(buffer: ByteBuffer): Int {
        val stringBuffer = ByteArray(8)
        buffer.get(stringBuffer)

        return String(stringBuffer).toLong(16).toInt()
    }

    private fun skipBlock(
        buffer: ByteBuffer,
        size: Int,
    ) {
        buffer.position(buffer.position() + size)
    }
}
