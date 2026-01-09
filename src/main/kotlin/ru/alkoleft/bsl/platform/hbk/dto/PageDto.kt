/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.dto

import ru.alkoleft.bsl.platform.hbk.models.DoubleLanguageString
import ru.alkoleft.bsl.platform.hbk.models.Page

/**
 * DTO для представления страницы в REST API.
 *
 * @property title Заголовок страницы на двух языках
 * @property htmlPath Путь к HTML файлу в архиве
 * @property children Список дочерних страниц
 * @property hasChildren Флаг наличия дочерних элементов (для оптимизации)
 */
data class PageDto(
    val title: DoubleLanguageString,
    val htmlPath: String,
    val children: List<PageDto> = emptyList(),
    val hasChildren: Boolean = false,
) {
    companion object {
        /**
         * Преобразует модель Page в DTO с полной рекурсией.
         */
        fun from(page: Page): PageDto =
            PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                children = page.children.map { from(it) },
                hasChildren = page.children.isNotEmpty(),
            )

        /**
         * Преобразует модель Page в DTO без дочерних элементов (только корневой уровень).
         * Используется для оптимизации загрузки больших оглавлений.
         */
        fun fromLite(page: Page): PageDto =
            PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                children = emptyList(),
                hasChildren = page.children.isNotEmpty(),
            )

        /**
         * Преобразует модель Page в DTO с ограниченной глубиной рекурсии.
         *
         * @param maxDepth Максимальная глубина вложенности (0 = только текущий уровень)
         */
        fun fromWithDepth(
            page: Page,
            maxDepth: Int,
        ): PageDto {
            if (maxDepth <= 0) {
                return fromLite(page)
            }
            return PageDto(
                title = page.title,
                htmlPath = page.htmlPath,
                children = page.children.map { fromWithDepth(it, maxDepth - 1) },
                hasChildren = page.children.isNotEmpty(),
            )
        }
    }
}
