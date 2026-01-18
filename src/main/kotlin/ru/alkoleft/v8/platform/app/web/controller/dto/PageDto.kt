/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

import ru.alkoleft.v8.platform.shctx.models.DoubleLanguageString
import ru.alkoleft.v8.platform.shctx.models.Page

/**
 * DTO для представления страницы в REST API.
 *
 * @property title Заголовок страницы на двух языках
 * @property htmlPath Путь к HTML файлу в архиве
 * @property path Путь от корня (массив индексов от корня до элемента) для уникальной идентификации элементов с одинаковым htmlPath
 * @property children Список дочерних страниц
 * @property hasChildren Флаг наличия дочерних элементов (для оптимизации)
 */
data class PageDto(
    val title: DoubleLanguageString,
    val htmlPath: String,
    val path: List<Int> = emptyList(),
    val children: List<PageDto> = emptyList(),
    val hasChildren: Boolean = false,
) {
    companion object {
        /**
         * Преобразует модель Page в DTO с полной рекурсией.
         *
         * @param page Страница для преобразования
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun from(
            page: Page,
            path: List<Int> = emptyList(),
        ): PageDto =
            PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                path = path,
                children = page.children.mapIndexed { index, child -> from(child, path + index) },
                hasChildren = page.children.isNotEmpty(),
            )

        /**
         * Преобразует модель Page в DTO без дочерних элементов (только корневой уровень).
         * Используется для оптимизации загрузки больших оглавлений.
         *
         * @param page Страница для преобразования
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun fromLite(
            page: Page,
            path: List<Int> = emptyList(),
        ): PageDto =
            PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                path = path,
                children = emptyList(),
                hasChildren = page.children.isNotEmpty(),
            )

        /**
         * Преобразует модель Page в DTO с ограниченной глубиной рекурсии.
         *
         * @param page Страница для преобразования
         * @param maxDepth Максимальная глубина вложенности (0 = только текущий уровень)
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun fromWithDepth(
            page: Page,
            maxDepth: Int,
            path: List<Int> = emptyList(),
        ): PageDto {
            if (maxDepth <= 0) {
                return fromLite(page, path)
            }
            return PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                path = path,
                children = page.children.mapIndexed { index, child -> fromWithDepth(child, maxDepth - 1, path + index) },
                hasChildren = page.children.isNotEmpty(),
            )
        }
    }
}
