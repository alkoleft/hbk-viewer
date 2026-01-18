/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.cli

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.cli.ExperimentalCli
import kotlinx.cli.Subcommand
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

private val logger = KotlinLogging.logger { }

@OptIn(ExperimentalCli::class)
fun Subcommand.getHbkFilePath(hbkPath: String): Path? {
    val path = Paths.get(hbkPath)
    if (!Files.exists(path) || !Files.isRegularFile(path)) {
        logger.error { "HBK файл не существует или не является файлом: $path" }
        return null
    }
    return path
}

/**
 * Получает и проверяет путь к выходной директории.
 *
 * @return Путь к директории или null, если директория не может быть создана
 */
fun Subcommand.getOutputPath(outputDir: String): Path? {
    val path = Paths.get(outputDir)
    if (!Files.exists(path)) {
        try {
            Files.createDirectories(path)
            logger.debug { "Создана выходная директория: $path" }
        } catch (e: Exception) {
            logger.error(e) { "Не удалось создать выходную директорию: $path" }
            return null
        }
    }
    if (!Files.isDirectory(path)) {
        logger.error { "Выходной путь не является директорией: $path" }
        return null
    }
    return path
}