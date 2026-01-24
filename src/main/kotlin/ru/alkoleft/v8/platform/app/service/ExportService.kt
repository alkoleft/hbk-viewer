/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import ru.alkoleft.v8.platform.app.formatters.MkDocsToc
import ru.alkoleft.v8.platform.app.formatters.TocFormatter
import java.nio.file.Path

private val logger = KotlinLogging.logger { }

class ExportService {
    fun exportBook(
        hbkFilePath: Path,
        outputPath: Path,
    ) {
        performExportBook(hbkFilePath, outputPath)
        logger.info { "Экспорт завершен успешно" }
    }

    fun exportBookToMkDocs(
        hbkFilePath: Path,
        outputPath: Path,
    ) {
        performExportBook(hbkFilePath, outputPath.resolve("docs"))
        performExportBookToc(hbkFilePath, outputPath, MkDocsToc())
        logger.info { "Экспорт завершен успешно" }
    }

    /**
     * Выполняет экспорт HBK файла.
     *
     * @param hbkFilePath Путь к HBK файлу
     * @param outputPath Путь к выходной директории
     */
    private fun performExportBook(
        hbkFilePath: Path,
        outputPath: Path,
    ) {
        logger.info { "Экспорт книги $hbkFilePath в $outputPath" }
        HbkExportService().export(
            hbkPath = hbkFilePath,
            outputDir = outputPath,
        )
    }

    private fun performExportBookToc(
        hbkFilePath: Path,
        outputPath: Path,
        formatter: TocFormatter,
    ) {
        logger.info { "Экспорт книги $hbkFilePath в $outputPath" }
        val toc = HbkExportService().toc(hbkFilePath)
        formatter.export(toc, outputPath)
    }
}
