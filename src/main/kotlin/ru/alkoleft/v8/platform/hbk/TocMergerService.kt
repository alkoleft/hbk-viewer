/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk

import io.github.oshai.kotlinlogging.KotlinLogging
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.model.PageBuilder
import ru.alkoleft.v8.platform.hbk.model.TocRecord
import ru.alkoleft.v8.platform.hbk.reader.toc.BookPage
import ru.alkoleft.v8.platform.hbk.reader.toc.GlobalToc
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc

private val logger = KotlinLogging.logger { }

/**
 * Сервис для объединения оглавлений (TOC) из нескольких HBK файлов.
 *
 * Объединяет оглавления из всех найденных HBK файлов в директории,
 * объединяя узлы с одинаковыми путями или названиями.
 */
object TocMergerService {
    /**
     * Объединяет несколько оглавлений в одно.
     *
     * @param items Список оглавлений для объединения
     * @return Объединенное оглавление
     */
    fun mergeToc(items: List<Toc>): Toc {
        if (items.isEmpty()) {
            return Toc.EMPTY
        } else if (items.size == 1) {
            return items.first()
        }

        // Собираем все корневые страницы
        val allRootPages = items.flatMap { it.pages }

        // Объединяем корневые страницы
        val mergedRootPages = mergePagesAtLevel(allRootPages)

        return Toc(mergedRootPages)
    }

    fun merge(items: List<Pair<BookInfo, Toc>>): GlobalToc {
        if (items.isEmpty()) {
            return GlobalToc.EMPTY
        }

        val rootPage = PageBuilder(BookInfo("", "", 0L, null, "root"), "", "")

        val books =
            items
                .asSequence()
                .map { it.first }
                .filter { it.meta != null }
                .sortedByDescending { it.size }
                .toMutableList()

        val tocByBook = items.associate { it }
        val firstBook = books.removeAt(0)
        tocByBook[firstBook]!!.pages.forEach { addRecursive(rootPage, it, firstBook) }

        books.forEach { book ->
            mergeTo(rootPage, tocByBook[book]!!.pages, book)
        }

        setUniqueLocations(rootPage.children, mutableMapOf())

        return GlobalToc(rootPage.children.map(BookPage::fromPageBuilder))
    }

    private fun setUniqueLocations(
        pages: List<PageBuilder>,
        locationMap: MutableMap<String, Int>,
    ) {
        pages.forEach { page ->
            page.locationIndex = locationMap.getOrDefault(page.location, 0)
            locationMap.put(page.location, page.locationIndex + 1)
            setUniqueLocations(page.children, locationMap)
        }
    }

    /**
     * Объединяет страницы на одном уровне иерархии.
     *
     * @param pages Список страниц для объединения
     * @return Список объединенных страниц
     */
    private fun mergePagesAtLevel(pages: List<TocRecord>): List<TocRecord> {
        // Создаем карту для объединения страниц по ключу
        val mergedPagesMap = mutableMapOf<String, TocRecord>()

        for (page in pages) {
            val key = createPageKey(page)
            val existingPage = mergedPagesMap[key]

            if (existingPage != null) {
                // Страница уже существует - объединяем дочерние элементы
                logger.trace { "Объединение существующей страницы: $key" }

                // Объединяем дочерние элементы рекурсивно
                val mergedChildren =
                    mergePagesAtLevel(
                        existingPage.subRecords + page.subRecords,
                    )

                // Обновляем список дочерних элементов
                existingPage.subRecords.clear()
                existingPage.subRecords.addAll(mergedChildren)
            } else {
                // Создаем новую страницу
                logger.trace { "Создание новой страницы: $key" }
                val newPage =
                    TocRecord(
                        title = page.title,
                        location = page.location,
                        subRecords = mutableListOf(),
                    )

                // Рекурсивно объединяем дочерние элементы
                val mergedChildren = mergePagesAtLevel(page.subRecords)
                newPage.subRecords.addAll(mergedChildren)

                mergedPagesMap[key] = newPage
            }
        }

        return mergedPagesMap.values.toList()
    }

    /**
     * Создает ключ для страницы.
     *
     * Ключ основан на htmlPath (если он не пустой) или на комбинации названий.
     *
     * @param page Страница
     * @return Ключ страницы
     */
    private fun createPageKey(page: TocRecord): String = page.title.en

    /**
     * Строит текстовое представление оглавления.
     *
     * @param pages Список страниц для форматирования
     * @param indentLevel Уровень отступа для иерархии
     * @return Текстовое представление оглавления
     */
    private fun buildTocContent(
        pages: List<TocRecord>,
        indentLevel: Int,
    ): String {
        val indent = "  ".repeat(indentLevel)
        val builder = StringBuilder()

        for (page in pages) {
            val title =
                when {
                    page.title.ru.isNotEmpty() && page.title.en.isNotEmpty() -> {
                        "${page.title.ru} (${page.title.en})"
                    }

                    page.title.ru.isNotEmpty() -> page.title.ru
                    else -> page.title.en
                }

            builder.append(indent)
            builder.append("- ")
            builder.append(title)

            if (page.location.isNotEmpty()) {
                builder.append(" -> ")
                builder.append(page.location)
            }

            builder.appendLine()

            if (page.subRecords.isNotEmpty()) {
                builder.append(buildTocContent(page.subRecords, indentLevel + 1))
            }
        }

        return builder.toString()
    }

    private fun mergeTo(
        rootPage: PageBuilder,
        pages: List<TocRecord>,
        book: BookInfo,
    ) {
        for (page in pages) {
            val existsPage = rootPage.getChildren(page.title.get())
            if (existsPage == null) {
                addRecursive(rootPage, page, book)
            } else {
                if (existsPage.location.isEmpty() && page.location.isNotEmpty()) {
                    existsPage.book = book
                } else if (page.location != existsPage.location && page.location.isNotEmpty() && existsPage.location.isNotEmpty()) {
                    logger.warn { "Разные адреса страниц '${page.title}': '${page.location}' != '${existsPage.location}'" }
                }
                mergeTo(existsPage, page.subRecords, book)
            }
        }
    }

    private fun addRecursive(
        target: PageBuilder,
        source: TocRecord,
        book: BookInfo,
    ) {
        val newPage = target.add(source, book)
        source.subRecords.forEach { addRecursive(newPage, it, book) }
    }
}
