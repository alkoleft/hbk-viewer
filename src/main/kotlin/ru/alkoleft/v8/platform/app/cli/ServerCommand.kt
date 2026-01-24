/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(ExperimentalCli::class)

/*
 * Copyright (c) 2024-2025 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.cli

import kotlinx.cli.ArgType
import kotlinx.cli.ExperimentalCli
import kotlinx.cli.Subcommand
import kotlinx.cli.default
import kotlinx.cli.required
import org.springframework.boot.runApplication
import ru.alkoleft.v8.platform.HbkReaderApplication

/**
 * CLI команда для запуска web сервера.
 */
class ServerCommand : Subcommand("server", "Запускает web сервер приложения") {
    private val platformPath by option(
        ArgType.String,
        shortName = "p",
        fullName = "path",
        description = "Директория с HBK файлами",
    ).required()

    private val verbose by option(
        ArgType.Boolean,
        shortName = "v",
        fullName = "verbose",
        description = "Включить отладочное логирование",
    ).default(false)

    override fun execute() {
        // Устанавливаем системные свойства из опций команды
        System.setProperty("hbk.files.directory", platformPath)
        if (verbose) {
            System.setProperty("logging.level.root", "DEBUG")
        }

        // Запускаем Spring Boot приложение
        // Аргументы уже обработаны парсером, передаем пустой массив
        runApplication<HbkReaderApplication>()
    }
}
