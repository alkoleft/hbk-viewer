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

private const val FILE_DESCRIPTION_SIZE = 12 // int * 4
private const val BLOCK_HEADER_SIZE = 31
private const val CONTAINER_HEADER_SIZE = 16
private const val SPLITTER = Int.MAX_VALUE

private val log = KotlinLogging.logger { }

/**
 * Извлекает содержимое из файловых контейнеров платформы 1С:Предприятие (hbk, cf, epf).
 * https://infostart.ru/1c/articles/250142/
 */
class ContainerReader {
    companion object {
        fun <T> readContainer(
            path: Path,
            block: EntitiesScope.() -> T,
        ): T = ContainerReader().readContainer(path, block)
    }

    /**
     * Область видимости для работы с сущностями контейнера.
     *
     * Предоставляет доступ к извлеченным сущностям и буферу данных.
     *
     * @property entities Карта имен сущностей к их адресам в буфере
     * @property buffer Буфер с данными файла
     */
    inner class EntitiesScope(
        val entities: Map<String, Int>,
        val buffer: MappedByteBuffer,
    ) {
        /**
         * Получает содержимое сущности по имени.
         *
         * @param name Имя сущности в контейнере
         * @return Массив байтов с содержимым сущности или null, если сущность не найдена
         */
        fun getEntity(name: String): ByteArray? = entities[name]?.let { readFileBody(buffer, it) }
    }

    fun <T> readContainer(
        path: Path,
        block: EntitiesScope.() -> T,
    ): T {
        log.debug { "Reading container file: $path" }
        if (!path.toFile().exists()) {
            throw IllegalArgumentException("File not exists '$path'")
        }
        FileInputStream(path.toFile()).use { stream ->
            val channel = stream.channel
            val buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size())

            val entities = entities(buffer)
            entities.forEach { log.trace { "Entry: $it" } }
            return EntitiesScope(entities, buffer).let(block)
        }
    }

    private fun entities(buffer: ByteBuffer): Map<String, Int> {
        val result = mutableMapOf<String, Int>()
        buffer.order(ByteOrder.LITTLE_ENDIAN)

        readContainerHeader(buffer)

        val fileInfos = readBlock(buffer)

        val remainingBuffer = ByteBuffer.wrap(fileInfos).order(ByteOrder.LITTLE_ENDIAN)
        val count = remainingBuffer.capacity() / FILE_DESCRIPTION_SIZE

        repeat(count) {
            val headerAddress = remainingBuffer.int
            val bodyAddress = remainingBuffer.int
            val reserved = remainingBuffer.int
            if (reserved != SPLITTER) {
                throw RuntimeException()
            }

            val name = readFileName(buffer, headerAddress)
            if (bodyAddress != SPLITTER) {
                result[name] = bodyAddress
            } else {
                log.debug { "Skip entry '$name' with body address $bodyAddress" }
            }
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
        if (log.isTraceEnabled()) {
            log.trace { "Адрес первого свободного блока: ${buffer.int}" }
            log.trace { "Размер блока по умолчанию: ${buffer.int}" }
            log.trace { "Поле неизвестного назначения: ${buffer.int}" }
            log.trace { "Зарезервированное поле: ${buffer.int}" }
        } else {
            buffer.skip(16) // int * 4
        }
    }

    private fun readBlock(buffer: ByteBuffer) = readBlockContent(buffer, readBlockHeader(buffer))

    private fun readBlockHeader(buffer: ByteBuffer): Block {
        // заголовок блока
        buffer.skip(2) // CRLF
        val payloadSize = buffer.longAsString()
        buffer.get() // Пробел
        val blockSize = buffer.longAsString()
        buffer.get() // Пробел
        val nextBlock = buffer.longAsString()
        buffer.skip(1) // Пробел
        buffer.skip(2) // CRLF
        //
        return Block(payloadSize, blockSize, nextBlock).also {
            log.trace { "Read block header: $it" }
        }
    }

    private fun readBlockContent(
        buffer: ByteBuffer,
        block: Block,
    ): ByteArray {
        val fileInfos = ByteArray(block.payloadSize)
        var currentBlock = block
        var blockOffset = 0
        log.trace { "Reading block content: $block" }
        do {
            val length = min(currentBlock.blockSize, block.payloadSize - blockOffset)
            log.trace { "Read block chunk. Length = $length" }
            buffer.get(fileInfos, blockOffset, length)
            blockOffset += length
            if (currentBlock.hasNextBlock) {
                buffer.position(currentBlock.nextBlockPosition)
                currentBlock = readBlockHeader(buffer)
            } else {
                break
            }
        } while (true)
        log.trace { "Reading block content success" }

        return fileInfos
    }

    private fun readFileName(
        buffer: ByteBuffer,
        headerAddress: Int,
    ): String {
        buffer.position(headerAddress)
        val blockHeader = readBlockHeader(buffer)
        val block = readBlockContent(buffer, blockHeader)
        val name = block.sliceArray(20 until block.size - 4)

        return String(name, StandardCharsets.UTF_16LE)
    }

    private fun readFileBody(
        buffer: ByteBuffer,
        bodyAddress: Int,
    ): ByteArray {
        buffer.position(bodyAddress)

        val block = readBlockHeader(buffer)
        val blockData = readBlockContent(buffer, block)

        return blockData
    }
}

private fun ByteBuffer.longAsString(): Int {
    val stringBuffer = ByteArray(8)
    get(stringBuffer)

    return String(stringBuffer).toLong(16).toInt()
}

private fun ByteBuffer.skip(size: Int) = position(position() + size)

data class Block(
    val payloadSize: Int,
    val blockSize: Int,
    val nextBlockPosition: Int = SPLITTER,
) {
    val hasNextBlock: Boolean
        get() = nextBlockPosition != SPLITTER
}
