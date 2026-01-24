/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.toc

import ru.alkoleft.v8.platform.hbk.model.DoubleLanguageString
import ru.alkoleft.v8.platform.hbk.model.TocRecord

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
 * @see TocRecord для представления отдельных страниц
 */
class Toc {
    constructor(pages: List<TocRecord>) {
        this.pages = pages
    }

    val pages: List<TocRecord>

    /**
     * Находит страницу по contentPath в иерархии оглавления.
     *
     * @param location Путь к HTML файлу
     * @return Найденная страница или null
     */
    fun findPageByLocation(location: String) = TocExtension.getPageByContentPath(pages, location, null)?.first

    fun findPageWithTruckByLocation(location: String) = TocExtension.findPageWithTruckByLocation(pages, location)

    /**
     * Выполняет поиск страниц по запросу в заголовках.
     * Поиск выполняется по русскому и английскому названиям.
     *
     * @param query Поисковый запрос
     * @return Список найденных страниц с полной иерархией до корня
     */
    fun searchPages(query: String): List<TocRecord> {
        val lowerQuery = query.lowercase()
        val results = mutableListOf<TocRecord>()

        fun searchInPages(
            pages: List<TocRecord>,
            parentPath: List<TocRecord> = emptyList(),
        ) {
            for (page in pages) {
                val pageTitleRu = page.title.ru.lowercase()
                val pageTitleEn = page.title.en.lowercase()
                val matches = pageTitleRu.contains(lowerQuery) || pageTitleEn.contains(lowerQuery)

                if (matches) {
                    results.add(page)
                }

                if (page.subRecords.isNotEmpty()) {
                    searchInPages(page.subRecords, parentPath + page)
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
            val toc = TocRecord(DoubleLanguageString("TOC", "TOC"), "")
            val pagesById = mutableMapOf(0 to toc)

            parser.parseContent(packBlock).forEach { chunk ->
                pagesById[chunk.id] =
                    TocRecord(
                        title = chunk.title,
                        location = chunk.contentPath.trimStart('/'),
                        subRecords = mutableListOf(),
                    ).also { pagesById[chunk.parentId]?.subRecords?.add(it) }
            }
            return Toc(toc.subRecords.toList())
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
