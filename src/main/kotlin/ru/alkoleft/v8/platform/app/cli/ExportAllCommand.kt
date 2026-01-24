/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(ExperimentalCli::class)

package ru.alkoleft.v8.platform.app.cli

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.cli.ArgType
import kotlinx.cli.ExperimentalCli
import kotlinx.cli.Subcommand
import kotlinx.cli.default
import kotlinx.cli.required
import ru.alkoleft.v8.platform.app.formatters.MkDocsToc
import ru.alkoleft.v8.platform.app.service.HbkExportService
import ru.alkoleft.v8.platform.hbk.TocMergerService
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

private val logger = KotlinLogging.logger { }

/**
 * Подкоманда для экспорта всех HBK книг из указанной директории.
 *
 * Экспортирует все найденные HBK файлы в отдельные поддиректории
 * внутри выходной директории.
 */
class ExportAllCommand : Subcommand("all", "Экспортирует все HBK книги из указанной директории") {
    private val sourceDir by option(
        ArgType.String,
        shortName = "s",
        fullName = "source",
        description = "Директория с HBK файлами для экспорта",
    ).required()

    private val outputDir by option(
        ArgType.String,
        shortName = "o",
        fullName = "output",
        description = "Базовая директория для сохранения распакованных файлов",
    ).required()

    private val includeToc by option(
        ArgType.Boolean,
        shortName = "t",
        fullName = "include-toc",
        description = "Включить оглавление в экспорт (только для полного экспорта)",
    ).default(true)

    private val tocList = mutableListOf<Toc>()

    override fun execute() {
        tocList.clear()
        val sourceDirectory = getSourceDirectory() ?: return
        val baseOutputPath = Paths.get(outputDir)
        val hbkFiles = findHbkFiles(sourceDirectory)
        if (hbkFiles.isEmpty()) {
            return
        }
        logger.info { "Найдено HBK файлов: ${hbkFiles.size}" }
        val exportService = HbkExportService()
        var successCount = 0
        var errorCount = 0
        for (hbkFile in hbkFiles) {
            if (exportBook(hbkFile, baseOutputPath, exportService)) {
                successCount++
            } else {
                errorCount++
            }
        }

        if (includeToc) {
            val globalToc = TocMergerService.mergeToc(tocList)
            MkDocsToc().export(globalToc, baseOutputPath.resolve("mkdocs.yml"))
        }
        tocList.clear()
        logger.info { "Экспорт завершен. Успешно: $successCount, Ошибок: $errorCount" }
    }

    /**
     * Получает и проверяет исходную директорию с HBK файлами.
     *
     * @return Путь к директории или null, если директория не может быть определена или не существует
     */
    private fun getSourceDirectory(): Path? {
        val sourcePath = Paths.get(sourceDir)
        if (!Files.exists(sourcePath) || !Files.isDirectory(sourcePath)) {
            logger.error { "Директория не существует или не является директорией: $sourcePath" }
            return null
        }
        return sourcePath
    }

    /**
     * Находит все HBK файлы в указанной директории.
     *
     * @param directory Директория для поиска
     * @return Список путей к найденным HBK файлам
     */
    private fun findHbkFiles(directory: Path): List<Path> {
        logger.info { "Поиск HBK файлов в директории: $directory" }
        val hbkFiles =
            Files.list(directory).use { stream ->
                stream
                    .filter { Files.isRegularFile(it) }
                    .filter { it.fileName.toString().endsWith("_ru.hbk", ignoreCase = true) }
                    .toList()
            }
        if (hbkFiles.isEmpty()) {
            logger.warn { "HBK файлы не найдены в директории: $directory" }
        }
        return hbkFiles
    }

    /**
     * Экспортирует одну HBK книгу.
     *
     * @param hbkFile Путь к HBK файлу
     * @param baseOutputPath Базовая директория для сохранения
     * @param exportService Сервис для экспорта
     * @return true, если экспорт выполнен успешно, false в случае ошибки
     */
    private fun exportBook(
        hbkFile: Path,
        baseOutputPath: Path,
        exportService: HbkExportService,
    ): Boolean =
        try {
            logger.info { "Экспорт книги: ${hbkFile.fileName} в $baseOutputPath" }
            exportService.export(
                hbkPath = hbkFile,
                outputDir = baseOutputPath.resolve("docs"),
                fileNameResolver = { name -> if (name.contains(".")) name else "$name.md" },
            )
            logger.info { "Книга ${hbkFile.fileName} экспортирована успешно" }
            if (includeToc) {
                tocList.add(exportService.toc(hbkFile))
            }
            true
        } catch (e: Exception) {
            logger.error(e) { "Ошибка при экспорте книги: ${hbkFile.fileName}" }
            false
        }
}
