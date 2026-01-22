/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.toc

import ru.alkoleft.v8.platform.app.exeption.BookPageNotFoundException
import ru.alkoleft.v8.platform.hbk.model.Page

object TocExtension {
    fun findPageWithTruckByLocation(
        pages: List<Page>,
        location: String,
    ) = getPageByContentPath(pages, location, mutableListOf())?.let { it.first to it.second!! }
        ?: throw BookPageNotFoundException.byLocationOnly(location)

    /**
     * Находит страницу по contentPath в иерархии оглавления.
     *
     * @param location Путь к HTML файлу
     * @return Найденная страница или null
     */
    fun findPageByLocation(
        pages: List<Page>,
        location: String,
    ) = getPageByContentPath(pages, location, null)?.first

    /**
     * Получает дочерние элементы страницы по contentPath.
     *
     * @param location Путь к HTML файлу родительской страницы
     * @return Список дочерних страниц или пустой список, если страница не найдена
     */
    fun getChildrenByContentPath(
        pages: List<Page>,
        location: String,
    ): List<Page> {
        val page = findPageByLocation(pages, location)
        return page?.getChildren() ?: emptyList()
    }

    fun getPageByContentPath(
        pages: List<Page>,
        location: String,
        truck: MutableList<String>?,
    ): Pair<Page, MutableList<String>?>? {
        val key = location

        fun searchInPages(pages: List<Page>): Page? {
            for (page in pages) {
                if (page.location == key) {
                    return page
                }
                if (!page.getChildren().isNullOrEmpty()) {
                    val found = searchInPages(page.getChildren()!!)
                    truck?.add(page.location)
                    if (found != null) {
                        return found
                    }
                }
            }
            return null
        }
        return searchInPages(pages)?.let { it to truck }
    }
}
