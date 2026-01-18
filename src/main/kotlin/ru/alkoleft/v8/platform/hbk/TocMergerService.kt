/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk

import io.github.oshai.kotlinlogging.KotlinLogging
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.model.DoubleLanguageString
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.meta.BookMeta
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.nio.file.Files
import java.nio.file.Path

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
     * @param tocs Список оглавлений для объединения
     * @return Объединенное оглавление
     */
    fun mergeToc(tocs: List<Toc>): Toc {
        if (tocs.isEmpty()) {
            return Toc.EMPTY
        } else if (tocs.size == 1) {
            return tocs.first()
        }

        // Собираем все корневые страницы
        val allRootPages = tocs.flatMap { it.pages }

        // Объединяем корневые страницы
        val mergedRootPages = mergePagesAtLevel(allRootPages)

        return Toc(mergedRootPages)
    }

    fun merge(items: List<Pair<BookInfo, Toc>>): Toc {
        if (items.isEmpty()) {
            return Toc.EMPTY
        } else if (items.size == 1) {
            return items.first().second
        }

        val rootPage = PageBuilder(BookMeta("", "", emptyList()), "", "")

        val books = items
            .asSequence()
            .map { it.first }
            .filter { it.meta != null }
            .sortedByDescending { it.size }
            .toMutableList()

        val tocByBook = items.associate { it }
        val firstBook = books.removeAt(0)
        tocByBook[firstBook]!!.pages.forEach { addRecursive(rootPage, it, firstBook.meta!!) }

        books.forEach { book ->
            mergeTo(rootPage, tocByBook[book]!!.pages, book.meta!!)
        }

        return Toc(rootPage.children.map { it.toPage() })
    }


    /**
     * Объединяет страницы на одном уровне иерархии.
     *
     * @param pages Список страниц для объединения
     * @return Список объединенных страниц
     */
    private fun mergePagesAtLevel(pages: List<Page>): List<Page> {
        // Создаем карту для объединения страниц по ключу
        val mergedPagesMap = mutableMapOf<String, Page>()

        for (page in pages) {
            val key = createPageKey(page)
            val existingPage = mergedPagesMap[key]

            if (existingPage != null) {
                // Страница уже существует - объединяем дочерние элементы
                logger.trace { "Объединение существующей страницы: $key" }

                // Объединяем дочерние элементы рекурсивно
                val mergedChildren = mergePagesAtLevel(
                    existingPage.children + page.children
                )

                // Обновляем список дочерних элементов
                existingPage.children.clear()
                existingPage.children.addAll(mergedChildren)
            } else {
                // Создаем новую страницу
                logger.trace { "Создание новой страницы: $key" }
                val newPage = Page(
                    title = page.title,
                    htmlPath = page.htmlPath,
                    children = mutableListOf(),
                )

                // Рекурсивно объединяем дочерние элементы
                val mergedChildren = mergePagesAtLevel(page.children)
                newPage.children.addAll(mergedChildren)

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
    private fun createPageKey(page: Page): String = page.title.en

    /**
     * Экспортирует объединенное оглавление в текстовый файл.
     *
     * @param toc Оглавление для экспорта
     * @param outputPath Путь к файлу для сохранения
     */
    fun exportMergedToc(toc: Toc, outputPath: Path) {
        logger.info { "Экспорт объединенного TOC в файл: $outputPath" }

        val content = buildTocContent(toc.pages, 0)

        Files.createDirectories(outputPath.parent)
        Files.write(outputPath, content.toByteArray(Charsets.UTF_8))

        logger.info { "TOC экспортирован успешно. Размер файла: ${Files.size(outputPath)} байт" }
    }

    /**
     * Строит текстовое представление оглавления.
     *
     * @param pages Список страниц для форматирования
     * @param indentLevel Уровень отступа для иерархии
     * @return Текстовое представление оглавления
     */
    private fun buildTocContent(
        pages: List<Page>,
        indentLevel: Int,
    ): String {
        val indent = "  ".repeat(indentLevel)
        val builder = StringBuilder()

        for (page in pages) {
            val title = when {
                page.title.ru.isNotEmpty() && page.title.en.isNotEmpty() -> {
                    "${page.title.ru} (${page.title.en})"
                }

                page.title.ru.isNotEmpty() -> page.title.ru
                else -> page.title.en
            }

            builder.append(indent)
            builder.append("- ")
            builder.append(title)

            if (page.htmlPath.isNotEmpty()) {
                builder.append(" -> ")
                builder.append(page.htmlPath)
            }

            builder.appendLine()

            if (page.children.isNotEmpty()) {
                builder.append(buildTocContent(page.children, indentLevel + 1))
            }
        }

        return builder.toString()
    }

    private fun mergeTo(rootPage: PageBuilder, pages: List<Page>, book: BookMeta) {
        for (page in pages) {
            val existsPage = rootPage.getChildren(page.title.get())
            if (existsPage == null) {
                addRecursive(rootPage, page, book)
            } else {
                if (existsPage.htmlPath.isEmpty() && page.htmlPath.isNotEmpty()) {
                    existsPage.book = book
                } else if (page.htmlPath != existsPage.htmlPath && page.htmlPath.isNotEmpty() && existsPage.htmlPath.isNotEmpty()) {
                    logger.warn { "Разные адреса страниц '${page.title}': '${page.htmlPath}' != '${existsPage.htmlPath}'" }
                }
                mergeTo(existsPage, page.children, book)
            }
        }
    }

    private fun addRecursive(target: PageBuilder, source: Page, book: BookMeta) {
        val newPage = target.add(source, book)
        source.children.forEach { addRecursive(newPage, it, book) }
    }
}

private class PageBuilder(
    var book: BookMeta,
    val title: String,
    val htmlPath: String,
    val children: MutableList<PageBuilder> = mutableListOf()
) {
    fun contains(name: String) = false

    fun getChildren(name: String) =
        children.find { it.title.equals(name, true) }

    fun add(page: Page, book: BookMeta): PageBuilder {
        val newPage = PageBuilder(book, page.title.get(), htmlPath)
        children.add(newPage)
        return newPage
    }

    fun toPage(): Page {
        val childrenPages = children.map { it.toPage() }.toMutableList()
        return Page(DoubleLanguageString(title, ""), htmlPath, childrenPages)
    }
}

private fun DoubleLanguageString.get() =
    en.ifEmpty { ru }
