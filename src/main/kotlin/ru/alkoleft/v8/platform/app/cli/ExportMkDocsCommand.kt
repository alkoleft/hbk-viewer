/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(ExperimentalCli::class)

package ru.alkoleft.v8.platform.app.cli

import kotlinx.cli.ExperimentalCli
import kotlinx.cli.Subcommand

/**
 * CLI команда для экспорта HBK файлов.
 *
 * Поддерживает подкоманды:
 * - book - экспорт одной книги
 * - all - экспорт всех книг из директории
 */
class ExportMkDocsCommand : Subcommand("mkdocs", "Экспортирует HBK файлы") {
    init {
        subcommands(ExportMkDocsBookCommand())
    }

    override fun execute() {}
}
