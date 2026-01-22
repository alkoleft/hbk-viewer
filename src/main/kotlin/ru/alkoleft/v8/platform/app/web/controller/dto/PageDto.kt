/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.model.TocRecord

/**
 * DTO для представления страницы в REST API.
 *
 * @property title Заголовок страницы на двух языках
 * @property pagePath Путь к HTML файлу в архиве
 * @property tocPath Путь от корня (массив индексов от корня до элемента) для уникальной идентификации элементов с одинаковым htmlPath
 * @property children Список дочерних страниц
 * @property hasChildren Флаг наличия дочерних элементов (для оптимизации)
 */
data class PageDto(
    val title: String,
    val pagePath: String,
    val tocPath: List<String>?,
    val children: List<PageDto>?,
    val hasChildren: Boolean = false,
) {
    companion object {
        /**
         * Преобразует модель TocRecord в DTO с полной рекурсией.
         *
         * @param page Страница для преобразования
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun from(
            page: TocRecord,
            path: List<String> = emptyList(),
        ): PageDto =
            PageDto(
                title = page.title.get(),
                pagePath = page.location,
                tocPath = path.ifEmpty { null },
                children = page.subRecords.map { child -> from(child) }.ifEmpty { null },
                hasChildren = page.subRecords.isNotEmpty(),
            )

        /**
         * Преобразует модель TocRecord в DTO без дочерних элементов (только корневой уровень).
         * Используется для оптимизации загрузки больших оглавлений.
         *
         * @param page Страница для преобразования
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun fromLite(
            page: Page,
            path: List<String> = emptyList(),
        ): PageDto =
            PageDto(
                title = page.getTitle(),
                pagePath = page.location,
                tocPath = path.ifEmpty { null },
                children = null,
                hasChildren = !page.getChildren().isNullOrEmpty(),
            )

        /**
         * Преобразует модель TocRecord в DTO с ограниченной глубиной рекурсии.
         *
         * @param page Страница для преобразования
         * @param maxDepth Максимальная глубина вложенности (0 = только текущий уровень)
         * @param path Путь от корня до текущей страницы (массив индексов)
         */
        fun fromWithDepth(
            page: Page,
            maxDepth: Int,
            path: List<String> = emptyList(),
        ): PageDto {
            if (maxDepth <= 0) {
                return fromLite(page, path)
            }
            return PageDto(
                title = page.getTitle(),
                pagePath = page.location,
                tocPath = path.ifEmpty { null },
                children =
                    page
                        .getChildren()
                        ?.map { child ->
                            fromWithDepth(
                                child,
                                maxDepth - 1,
                            )
                        }?.ifEmpty { null },
                hasChildren = !page.getChildren().isNullOrEmpty(),
            )
        }
    }
}
