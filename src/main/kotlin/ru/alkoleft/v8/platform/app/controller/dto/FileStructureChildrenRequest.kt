/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.controller.dto

/**
 * DTO для запроса дочерних элементов структуры файла.
 *
 * @property htmlPath Путь к HTML файлу родительской страницы (используется если path не указан)
 * @property path Путь от корня до родительской страницы (массив индексов, например "0,2,1")
 */
data class FileStructureChildrenRequest(
    val htmlPath: String? = null,
    val path: String? = null,
) {
    /**
     * Проверяет, что указан хотя бы один параметр (htmlPath или path).
     */
    fun hasValidIdentifier(): Boolean = !htmlPath.isNullOrBlank() || !path.isNullOrBlank()
}
