/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.util

import io.github.oshai.kotlinlogging.KotlinLogging
import java.io.FileNotFoundException
import java.nio.file.Files
import java.nio.file.Path
import java.util.regex.Pattern

private val logger = KotlinLogging.logger { }

/**
 * Утилита для определения версии платформы 1С:Предприятие из файлов в директории установки.
 *
 * Версия определяется кроссплатформенно:
 * - На Linux/macOS: используется команда `strings` (если доступна), затем прямое чтение бинарного файла
 * - На Windows: используется только прямое чтение бинарного файла (файл `1cv8.exe`)
 * - На всех платформах: чтение бинарного файла работает одинаково
 *
 * Примеры использования:
 * ```
 * val platformDir = Path.of("/opt/1cv8/x86_64/8.5.1.189")  // Linux
 * val version = PlatformVersionDetector.detectVersion(platformDir)
 * // Результат: "8.5.1.189"
 * ```
 */
object PlatformVersionDetector {
    private const val EXECUTABLE_FILE_NAME_LINUX = "1cv8"
    private const val EXECUTABLE_FILE_NAME_WINDOWS = "1cv8.exe"
    private val VERSION_PATTERN: Pattern = Pattern.compile("^8\\.\\d+\\.\\d+\\.\\d+$")
    private val VERSION_SEARCH_PATTERN: Pattern = Pattern.compile("8\\.\\d+\\.\\d+\\.\\d+")
    private val isWindows: Boolean = System.getProperty("os.name", "").lowercase().contains("windows")

    /**
     * Определяет версию платформы 1С из файлов в указанной директории.
     *
     * @param platformDirectory Путь к директории установки платформы 1С
     * @return Версия платформы в формате "8.x.x.x" или null, если версия не может быть определена
     * @throws FileNotFoundException если директория не существует или не содержит необходимых файлов
     */
    fun detectVersion(platformDirectory: Path): String? {
        logger.debug { "Попытка определить версию платформы из директории: $platformDirectory" }

        if (!Files.exists(platformDirectory) || !Files.isDirectory(platformDirectory)) {
            throw FileNotFoundException("Директория не существует: $platformDirectory")
        }

        // Определяем имя исполняемого файла в зависимости от платформы
        val executableFileName =
            if (isWindows) {
                EXECUTABLE_FILE_NAME_WINDOWS
            } else {
                EXECUTABLE_FILE_NAME_LINUX
            }

        val executableFile = platformDirectory.resolve(executableFileName)
        if (!Files.exists(executableFile) || !Files.isRegularFile(executableFile)) {
            logger.warn { "Исполняемый файл не найден: $executableFile" }
            return null
        }

        // На всех платформах используем прямое чтение бинарного файла
        val versionFromBinary = extractVersionFromBinary(executableFile)
        if (versionFromBinary != null) {
            logger.debug { "Версия определена из исполняемого файла (прямое чтение): $versionFromBinary" }
            return versionFromBinary
        }

        logger.warn { "Не удалось определить версию платформы из директории: $platformDirectory" }
        return null
    }

    /**
     * Извлекает версию из исполняемого файла путем прямого чтения и поиска строковых паттернов.
     * Кроссплатформенный метод. Исполняемые файлы 1С обычно не очень большие, поэтому
     * чтение всего файла в память приемлемо.
     */
    private fun extractVersionFromBinary(executableFile: Path): String? {
        return try {
            val bytes = Files.readAllBytes(executableFile)
            val content = String(bytes, Charsets.ISO_8859_1) // Используем ISO-8859-1 для чтения бинарных данных

            // Ищем все версии в виде строки "8.x.x.x" (без якорей для поиска подстроки)
            val matcher = VERSION_SEARCH_PATTERN.matcher(content)
            val foundVersions = mutableListOf<String>()
            while (matcher.find()) {
                val foundVersion = matcher.group()
                foundVersions.add(foundVersion)
            }

            // Выводим все найденные версии в лог
            logger.debug { "Все найденные версии в файле $executableFile: $foundVersions" }
            println("Все найденные версии в файле $executableFile: $foundVersions")

            if (foundVersions.isEmpty()) {
                return null
            }

            // Валидируем все найденные версии и выбираем валидные
            val validVersions = foundVersions.filter { isValidVersion(it) }
            logger.debug { "Валидные версии: $validVersions" }
            println("Валидные версии: $validVersions")

            if (validVersions.isEmpty()) {
                logger.debug { "Не найдено ни одной валидной версии" }
                return null
            }

            // Выбираем самую длинную версию (наиболее полную)
            validVersions.maxByOrNull { it.length } ?: validVersions.last()
        } catch (e: OutOfMemoryError) {
            logger.warn(e) { "Файл слишком большой для чтения в память: $executableFile" }
            null
        } catch (e: Exception) {
            logger.warn(e) { "Ошибка при чтении исполняемого файла: $executableFile" }
            null
        }
    }

    /**
     * Проверяет, является ли строка валидной версией платформы 1С.
     */
    private fun isValidVersion(version: String): Boolean = version.isNotBlank() && VERSION_PATTERN.matcher(version).matches()
}
