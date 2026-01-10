/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.meta

/**
 * DTO для представления описания страницы (книги) в HBK файле.
 *
 * Содержит информацию о книге, ее файле и связанных тегах.
 *
 * @property bookName Имя книги
 * @property description Описание книги
 * @property tags Список тегов, связанных с книгой
 */
data class BookMeta(
    val bookName: String,
    val description: String,
    val tags: List<String>,
)
