/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.toc

import ru.alkoleft.v8.platform.app.exeption.BookPageNotFoundException
import ru.alkoleft.v8.platform.hbk.model.Chunk
import ru.alkoleft.v8.platform.hbk.model.DoubleLanguageString
import ru.alkoleft.v8.platform.hbk.model.NameContainer
import ru.alkoleft.v8.platform.hbk.model.NameObject
import ru.alkoleft.v8.platform.hbk.model.Page

/**
 * Представляет оглавление (Table of Contents) HBK файла.
 *
 * Класс содержит иерархическую структуру страниц документации,
 * извлеченную из сжатого блока PackBlock HBK файла. Оглавление
 * используется для навигации по документации и определения
 * типов страниц.
 *
 * Основные возможности:
 * - Парсинг структуры оглавления из бинарных данных
 * - Предоставление доступа к иерархии страниц
 * - Извлечение заголовков на двух языках
 * - Получение путей к HTML файлам
 *
 * @see TocParser для парсинга бинарных данных оглавления
 * @see Page для представления отдельных страниц
 */
class Toc {
    constructor(pages: List<Page>) {
        this.pages = pages
    }

    val pages: List<Page>

    /**
     * Находит страницу по contentPath в иерархии оглавления.
     *
     * @param location Путь к HTML файлу
     * @return Найденная страница или null
     */
    fun findPageByLocation(location: String) = getPageByContentPath(location, null)?.first

    fun findPageWithTruckByLocation(location: String) =
        getPageByContentPath(location, mutableListOf())?.let { it.first to it.second!! }
            ?: throw BookPageNotFoundException.byLocationOnly(location)

    private fun getPageByContentPath(
        location: String,
        truck: MutableList<String>?,
    ): Pair<Page, MutableList<String>?>? {
        val key = location

        fun searchInPages(pages: List<Page>): Page? {
            for (page in pages) {
                if (page.location == key) {
                    return page
                }
                if (page.children.isNotEmpty()) {
                    val found = searchInPages(page.children)
                    truck?.add(page.location)
                    if (found != null) {
                        return found
                    }
                }
            }
            return null
        }
        return searchInPages(this.pages)?.let { it to truck }
    }

    /**
     * Получает дочерние элементы страницы по contentPath.
     *
     * @param location Путь к HTML файлу родительской страницы
     * @return Список дочерних страниц или пустой список, если страница не найдена
     */
    fun getChildrenByContentPath(location: String): List<Page> {
        val page = findPageByLocation(location)
        return page?.children ?: emptyList()
    }

    /**
     * Находит страницу по пути от корня (breadcrumb path).
     * Путь представляет собой массив индексов от корня до элемента.
     * Например, [0, 2, 1] означает: корневой элемент с индексом 0, его дочерний с индексом 2, и дочерний предыдущего с индексом 1.
     *
     * @param path Путь от корня (массив индексов)
     * @return Найденная страница или null, если путь неверен
     */
    fun findPageByPath(path: List<Int>): Page? {
        if (path.isEmpty()) {
            return null
        }

        var currentPages = this.pages
        var currentPage: Page? = null

        for (index in path) {
            if (index < 0 || index >= currentPages.size) {
                return null
            }
            currentPage = currentPages[index]
            currentPages = currentPage.children
        }

        return currentPage
    }

    /**
     * Получает дочерние элементы страницы по пути от корня.
     * Это позволяет однозначно идентифицировать элемент даже если несколько элементов имеют одинаковый contentPath.
     *
     * @param path Путь от корня до родительской страницы (массив индексов)
     * @return Список дочерних страниц или пустой список, если страница не найдена
     */
    fun getChildrenByPath(path: List<Int>): List<Page> {
        val page = findPageByPath(path)
        return page?.children ?: emptyList()
    }

    /**
     * Выполняет поиск страниц по запросу в заголовках.
     * Поиск выполняется по русскому и английскому названиям.
     *
     * @param query Поисковый запрос
     * @return Список найденных страниц с полной иерархией до корня
     */
    fun searchPages(query: String): List<Page> {
        val lowerQuery = query.lowercase()
        val results = mutableListOf<Page>()

        fun searchInPages(
            pages: List<Page>,
            parentPath: List<Page> = emptyList(),
        ) {
            for (page in pages) {
                val pageTitleRu = page.title.ru.lowercase()
                val pageTitleEn = page.title.en.lowercase()
                val matches = pageTitleRu.contains(lowerQuery) || pageTitleEn.contains(lowerQuery)

                if (matches) {
                    results.add(page)
                }

                if (page.children.isNotEmpty()) {
                    searchInPages(page.children, parentPath + page)
                }
            }
        }

        searchInPages(this.pages)
        return results
    }

    companion object {
        val EMPTY = Toc(emptyList())

        /**
         * Парсит оглавление из сжатого блока данных.
         *
         * @param packBlock Сжатые данные оглавления
         * @return Объект оглавления с иерархией страниц
         */
        fun parse(packBlock: ByteArray): Toc {
            val parser = TocParser()
            val toc = Page(DoubleLanguageString("TOC", "TOC"), "")
            val pagesById = mutableMapOf(0 to toc)

            parser.parseContent(packBlock).forEach { chunk ->
                pagesById[chunk.id] =
                    Page(
                        title = chunk.title,
                        location = chunk.contentPath.trimStart('/'),
                        children = mutableListOf(),
                    ).also { pagesById[chunk.parentId]?.children?.add(it) }
            }
            return Toc(toc.children.toList())
        }

        private fun getName(nameContext: NameObject): String = nameContext.name.replace("\"", "")

        /**
         * Получает заголовок чанка на двух языках.
         */
        val Chunk.title: DoubleLanguageString
            get() {
                val nameContainer: NameContainer = properties.nameContainer
                val namesContext: List<NameObject>? = nameContainer.nameObjects

                if (namesContext == null || namesContext.isEmpty()) {
                    return DoubleLanguageString("", "")
                } else if (namesContext.size == 1) {
                    val engName: NameObject = namesContext[0]
                    return DoubleLanguageString(getName(engName), "")
                } else {
                    val ruName: NameObject = namesContext[0]
                    val engName: NameObject = namesContext[1]
                    return DoubleLanguageString(getName(engName), getName(ruName))
                }
            }

        /**
         * Получает путь к HTML файлу чанка.
         */
        val Chunk.contentPath: String
            get() = properties.htmlPath.replace("\"", "")
    }
}
