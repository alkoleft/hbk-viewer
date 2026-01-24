/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(ExperimentalCli::class)

package ru.alkoleft.v8.platform.app.cli

import kotlinx.cli.ArgType
import kotlinx.cli.ExperimentalCli
import kotlinx.cli.Subcommand
import kotlinx.cli.required
import ru.alkoleft.v8.platform.app.service.ExportService

/**
 * Подкоманда для экспорта одной HBK книги.
 *
 * Поддерживает:
 * - Полный экспорт всех файлов из HBK архива
 * - Экспорт только HTML страниц
 * - Экспорт с оглавлением или без
 */
class ExportBookCommand : Subcommand("book", "Экспортирует одну HBK книгу в указанную директорию") {
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
        ExportService().exportBook(hbkFilePath, outputPath)
    }
}
