/*
 * Copyright (c) 2024-2025 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform

import kotlinx.cli.ArgParser
import kotlinx.cli.ArgType
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@SpringBootApplication
@EnableCaching
class HbkReaderApplication

fun main(args: Array<String>) {
    val parser = ArgParser("hbk-reader")

    val platformPath by parser.option(
        ArgType.String,
        shortName = "p",
        fullName = "platform-path",
        description = "Путь к каталогу платформы 1С",
    )
    val verbose by parser.option(
        ArgType.Boolean,
        shortName = "v",
        fullName = "verbose",
        description = "Включить отладочное логированиеС",
    )

    parser.parse(args)

    if (!platformPath.isNullOrBlank()) {
        System.setProperty("platform.context.path", platformPath as String)
    }
    if (verbose ?: false) {
        System.setProperty("logging.level.root", "DEBUG")
    }

    runApplication<HbkReaderApplication>(*args)
}
