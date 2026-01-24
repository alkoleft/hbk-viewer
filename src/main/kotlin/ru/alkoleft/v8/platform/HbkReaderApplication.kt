/*
 * Copyright (c) 2024-2025 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(kotlinx.cli.ExperimentalCli::class)

package ru.alkoleft.v8.platform

import kotlinx.cli.ArgParser
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import ru.alkoleft.v8.platform.app.cli.ExportCommand
import ru.alkoleft.v8.platform.app.cli.ServerCommand
import ru.alkoleft.v8.platform.app.config.ApplicationProperties
import kotlin.system.exitProcess

@SpringBootApplication
@EnableCaching
@EnableConfigurationProperties(ApplicationProperties::class)
class HbkReaderApplication

fun main(args: Array<String>) {
    val parser = ArgParser("hbk-reader", strictSubcommandOptionsOrder = false)

    // Регистрируем CLI команды
    val serverCommand = ServerCommand()
    val exportCommand = ExportCommand()
    parser.subcommands(serverCommand, exportCommand)

    try {
        parser.parse(args)
        // Команда была выполнена автоматически через execute()
    } catch (e: Exception) {
        println("Ошибка: ${e.message}")
        exitProcess(1)
    }
}
