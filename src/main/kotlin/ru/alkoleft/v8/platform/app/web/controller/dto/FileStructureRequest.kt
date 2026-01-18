/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * DTO для запроса структуры файла.
 *
 * @property depth Глубина загрузки подчиненных элементов (0 = только корневой уровень)
 */
data class FileStructureRequest(
    val depth: Int? = null,
)
