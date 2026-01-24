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
import kotlinx.cli.required
import ru.alkoleft.v8.platform.app.service.ExportService

private val logger = KotlinLogging.logger { }

/**
 * Подкоманда для экспорта всех HBK книг из указанной директории.
 *
 * Экспортирует все найденные HBK файлы в отдельные поддиректории
 * внутри выходной директории.
 */
class ExportMkDocsBookCommand : Subcommand("book", "Экспортирует все HBK книги из указанной в формате MkDocs") {
    private val hbkFilePath by option(
        ArgType.String,
        shortName = "f",
        fullName = "file",
        description = "Путь к HBK файлу для экспорта",
    ).required()

    private val outputDir by option(
        ArgType.String,
        shortName = "o",
        fullName = "output",
        description = "Директория для сохранения распакованных файлов",
    ).required()

    override fun execute() {
        val hbkFilePath = getHbkFilePath(hbkFilePath) ?: return
        val outputPath = getOutputPath(outputDir) ?: return
        ExportService().exportBookToMkDocs(hbkFilePath, outputPath)
    }
}
