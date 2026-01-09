/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.util

/**
 * Утилита для извлечения локали из имени HBK файла.
 *
 * Локаль определяется как суффикс после последнего символа "_" в имени файла.
 * Если суффикса нет или он пустой, возвращается "root" (английская локаль по умолчанию).
 *
 * Примеры:
 * - "shcntx_ru.hbk" → "ru"
 * - "shcntx_en.hbk" → "en"
 * - "shcntx.hbk" → "root"
 */
object LocaleExtractor {
    /**
     * Извлекает локаль из имени файла.
     *
     * @param filename Имя файла (например, "shcntx_ru.hbk")
     * @return Локаль ("ru", "en", "root" и т.д.)
     */
    fun extractLocale(filename: String): String {
        val nameWithoutExtension = filename.substringBeforeLast(".")
        val lastUnderscoreIndex = nameWithoutExtension.lastIndexOf("_")
        return if (lastUnderscoreIndex >= 0 && lastUnderscoreIndex < nameWithoutExtension.length - 1) {
            nameWithoutExtension.substring(lastUnderscoreIndex + 1)
        } else {
            "root"
        }
    }
}
