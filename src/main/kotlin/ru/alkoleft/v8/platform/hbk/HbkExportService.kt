/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk

import io.github.oshai.kotlinlogging.KotlinLogging
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry
import org.apache.commons.compress.archivers.zip.ZipFile
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel
import ru.alkoleft.v8.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.v8.platform.hbk.models.Page
import ru.alkoleft.v8.platform.hbk.reader.HbkContainerReader
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.util.zip.ZipInputStream

private const val PACK_BLOCK_NAME = "PackBlock"
private const val FILE_STORAGE_NAME = "FileStorage"
private const val TOC_FILE_NAME = "toc.txt"

private val logger = KotlinLogging.logger { }

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
     * @param includeToc Если true, сохраняет оглавление в текстовый файл
     * @throws PlatformContextLoadException если не удалось прочитать HBK файл
     * @throws IllegalArgumentException если выходная директория не может быть создана
     */
    fun export(
        hbkPath: Path,
        outputDir: Path,
        includeToc: Boolean = true,
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

        val containerReader = HbkContainerReader()
        containerReader.readHbk(hbkPath) {
            this.entities.forEach { Files.write(outputDir.resolve(it.key), getEntity(it.key)!!) }
            val fileStorage =
                getEntity(FILE_STORAGE_NAME)
                    ?: throw PlatformContextLoadException("Не найден блок FileStorage в HBK файле")

            val packBlock =
                getEntity(PACK_BLOCK_NAME)
                    ?: throw PlatformContextLoadException("Не найден блок PackBlock в HBK файле")

            exportZipFiles(fileStorage, outputDir)
            if (includeToc) {
                val toc = Toc.parse(getInflatePackBlock(packBlock))
                exportToc(toc, outputDir)
            }
        }

        logger.info { "Экспорт HBK файла завершен успешно" }
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
    ) {
        logger.debug { "Начало экспорта файлов из ZIP архива" }

        var exportedCount = 0

        SeekableInMemoryByteChannel(fileStorage).use { channel ->
            ZipFile
                .builder()
                .setSeekableByteChannel(channel)
                .get()
                .use { zipFile ->
                    val entries = zipFile.entries

                    while (entries.hasMoreElements()) {
                        val entry = entries.nextElement() as ZipArchiveEntry

                        if (entry.isDirectory) {
                            continue
                        }

                        val entryName = entry.name
                        val outputFile = outputDir.resolve(entryName).toFile()

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
     * Экспортирует оглавление (TOC) в текстовый файл.
     *
     * @param toc Оглавление для экспорта
     * @param outputDir Директория для сохранения файла TOC
     */
    private fun exportToc(
        toc: Toc,
        outputDir: Path,
    ) {
        logger.debug { "Начало экспорта оглавления" }

        val tocFile = outputDir.resolve(TOC_FILE_NAME).toFile()
        val tocContent = buildTocContent(toc.pages, 0)

        tocFile.writeText(tocContent, Charsets.UTF_8)

        logger.info { "Оглавление экспортировано в файл: ${tocFile.absolutePath}" }
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
            val title =
                if (page.title.ru.isNotEmpty()) {
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
     * Экспортирует только HTML файлы страниц, указанных в оглавлении.
     *
     * @param hbkPath Путь к HBK файлу
     * @param outputDir Директория для сохранения файлов
     * @param preserveStructure Если true, сохраняет структуру каталогов из путей страниц
     */
    fun exportPagesOnly(
        hbkPath: Path,
        outputDir: Path,
        preserveStructure: Boolean = true,
    ) {
        logger.info { "Начало экспорта только страниц из HBK файла $hbkPath" }

        val outputDirectory = outputDir.toFile()
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs()
        }

        val reader = HbkContentReader()
        var exportedCount = 0

        reader.read(hbkPath) {
            val pagesToExport = collectAllPages(toc.pages)

            for (page in pagesToExport) {
                if (page.htmlPath.isEmpty()) {
                    continue
                }

                try {
                    val outputPath =
                        if (preserveStructure) {
                            outputDir.resolve(page.htmlPath)
                        } else {
                            val fileName = File(page.htmlPath).name
                            outputDir.resolve(fileName)
                        }

                    outputPath.parent.toFile().mkdirs()

                    getEntryStream(page).use { inputStream ->
                        Files.copy(inputStream, outputPath, StandardCopyOption.REPLACE_EXISTING)
                    }

                    exportedCount++
                    logger.trace { "Экспортирована страница: ${page.htmlPath}" }
                } catch (e: PlatformContextLoadException) {
                    logger.warn(e) { "Не удалось экспортировать страницу: ${page.htmlPath}" }
                }
            }
        }

        logger.info { "Экспортировано страниц: $exportedCount" }
    }

    /**
     * Собирает все страницы из иерархии в плоский список.
     *
     * @param pages Список страниц для обхода
     * @return Плоский список всех страниц
     */
    private fun collectAllPages(pages: List<Page>): List<Page> {
        val result = mutableListOf<Page>()

        fun traverse(pages: List<Page>) {
            for (page in pages) {
                result.add(page)
                if (page.children.isNotEmpty()) {
                    traverse(page.children)
                }
            }
        }

        traverse(pages)
        return result
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
