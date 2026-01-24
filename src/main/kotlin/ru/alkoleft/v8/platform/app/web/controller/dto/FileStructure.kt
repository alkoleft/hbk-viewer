/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * Структура HBK файла (оглавление).
 *
 * @property filename Имя HBK файла
 * @property pages Иерархия страниц документации
 */
data class FileStructure(
    val filename: String,
    val pages: List<PageDto>,
)
