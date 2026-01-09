/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.dto

import ru.alkoleft.bsl.platform.hbk.reader.meta.BookMeta

/**
 * Информация о HBK книге (файле).
 *
 * @property filename Имя файла книги
 * @property path Полный путь к файлу
 * @property size Размер файла в байтах
 * @property meta Метаданные книги (может быть null при ошибке загрузки)
 * @property locale Локаль книги ("root" если не указана)
 */
data class BookInfo(
    val filename: String,
    val path: String,
    val size: Long,
    val meta: BookMeta?,
    val locale: String,
)
