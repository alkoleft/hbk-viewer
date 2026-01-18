/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * Содержимое страницы из HBK файла.
 *
 * @property filename Имя HBK файла
 * @property pageName Имя страницы
 * @property content HTML содержимое страницы
 */
data class FileContent(
    val filename: String,
    val pageName: String,
    val content: String,
)
