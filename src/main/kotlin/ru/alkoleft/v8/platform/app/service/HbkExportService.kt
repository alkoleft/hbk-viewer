/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry
import org.apache.commons.compress.archivers.zip.ZipFile
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel
import ru.alkoleft.v8.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.ContainerReader
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.io.ByteArrayInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.nio.file.Path
import java.util.zip.ZipInputStream

private const val PACK_BLOCK_NAME = "PackBlock"
private const val FILE_STORAGE_NAME = "FileStorage"

private val logger = KotlinLogging.logger { }

typealias FileNameResolver = (String) -> String

/**
 * Сервис для экспорта (распаковки) HBK файлов в файловую систему.
 *
 * Предоставляет функциональность для:
 * - Распаковки всех файлов из HBK архива в указанную директорию
 * - Сохранения структуры каталогов из архива
 * - Экспорта оглавления (TOC) в текстовый файл
 *
 * @see HbkContentReader для работы с содержимым HBK файла
 * @see Toc для работы с оглавлением
 */
class HbkExportService {
    /**
     * Экспортирует HBK файл в указанную директорию.
     *
     * @param hbkPath Путь к HBK файлу для экспорта
     * @param outputDir Директория для сохранения распакованных файлов
     * @throws PlatformContextLoadException если не удалось прочитать HBK файл
     * @throws IllegalArgumentException если выходная директория не может быть создана
     */
    fun export(
        hbkPath: Path,
        outputDir: Path,
        fileNameResolver: FileNameResolver = { it }
    ) {
        logger.info { "Начало экспорта HBK файла $hbkPath в директорию $outputDir" }

        if (!hbkPath.toFile().exists()) {
            throw IllegalArgumentException("HBK файл не существует: $hbkPath")
        }

        val outputDirectory = outputDir.toFile()
        if (!outputDirectory.exists()) {
            val created = outputDirectory.mkdirs()
            if (!created) {
                throw IllegalArgumentException("Не удалось создать выходную директорию: $outputDir")
            }
        }

        if (!outputDirectory.isDirectory) {
            throw IllegalArgumentException("Выходной путь не является директорией: $outputDir")
        }

        val containerReader = ContainerReader()
        containerReader.readContainer(hbkPath) {
//            this.entities.forEach { Files.write(outputDir.resolve(it.key), getEntity(it.key)!!) }
            val fileStorage = getEntity(FILE_STORAGE_NAME)
                ?: throw PlatformContextLoadException("Не найден блок FileStorage в HBK файле")
            exportZipFiles(fileStorage, outputDir, fileNameResolver)
        }

        logger.info { "Экспорт HBK файла завершен успешно" }
    }

    fun toc(hbkPath: Path): Toc {
        val containerReader = ContainerReader()
        return containerReader.readContainer(hbkPath) {
            val packBlock = getEntity(PACK_BLOCK_NAME)
                ?: throw PlatformContextLoadException("Не найден блок PackBlock в HBK файле")
            return@readContainer Toc.parse(getInflatePackBlock(packBlock))
        }
    }

    /**
     * Экспортирует все файлы из ZIP архива в файловую систему.
     *
     * @param fileStorage Байтовый массив с ZIP архивом
     * @param outputDir Директория для сохранения файлов
     */
    private fun exportZipFiles(
        fileStorage: ByteArray,
        outputDir: Path,
        fileNameResolver: FileNameResolver
    ) {
        logger.debug { "Начало экспорта файлов из ZIP архива" }

        var exportedCount = 0

        SeekableInMemoryByteChannel(fileStorage).use { channel ->
            ZipFile.builder().setSeekableByteChannel(channel).get().use { zipFile ->
                val entries = zipFile.entries

                while (entries.hasMoreElements()) {
                    val entry = entries.nextElement() as ZipArchiveEntry

                    if (entry.isDirectory) {
                        continue
                    }

                    val entryName = entry.name
                    val outputFile = outputDir.resolve(fileNameResolver(entryName)).toFile()

                    outputFile.parentFile?.mkdirs()

                    zipFile.getInputStream(entry).use { inputStream ->
                        FileOutputStream(outputFile).use { outputStream ->
                            inputStream.copyTo(outputStream)
                        }
                    }

                    exportedCount++
                    logger.trace { "Экспортирован файл: $entryName" }
                }
            }
        }

        logger.info { "Экспортировано файлов: $exportedCount" }
    }

    /**
     * Строит текстовое представление оглавления.
     *
     * @param pages Список страниц для форматирования
     * @param indentLevel Уровень отступа для иерархии
     * @return Текстовое представление оглавления
     */
    private fun buildTocContent(
        pages: List<Page>,
        indentLevel: Int,
    ): String {
        val indent = "  ".repeat(indentLevel)
        val builder = StringBuilder()

        for (page in pages) {
            val title = if (page.title.ru.isNotEmpty()) {
                "${page.title.ru} (${page.title.en})"
            } else {
                page.title.en
            }

            builder.append(indent)
            builder.append("- ")
            builder.append(title)

            if (page.htmlPath.isNotEmpty()) {
                builder.append(" -> ")
                builder.append(page.htmlPath)
            }

            builder.appendLine()

            if (page.children.isNotEmpty()) {
                builder.append(buildTocContent(page.children, indentLevel + 1))
            }
        }

        return builder.toString()
    }

    /**
     * Распаковывает сжатый блок PackBlock.
     *
     * @param data Сжатые данные
     * @return Распакованные данные
     */
    private fun getInflatePackBlock(data: ByteArray): ByteArray {
        val inflateData: ByteArray

        try {
            ZipInputStream(ByteArrayInputStream(data)).use { stream ->
                stream.nextEntry
                inflateData = stream.readAllBytes()
            }
        } catch (ex: IOException) {
            throw RuntimeException("Ошибка при распаковке PackBlock", ex)
        }

        return inflateData
    }
}
