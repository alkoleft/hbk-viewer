/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import ru.alkoleft.v8.platform.app.exeption.BookPageNotFoundException
import ru.alkoleft.v8.platform.app.storage.BookRegistry
import ru.alkoleft.v8.platform.hbk.TocMergerService
import ru.alkoleft.v8.platform.hbk.reader.toc.BookPage
import ru.alkoleft.v8.platform.hbk.reader.toc.GlobalToc
import kotlin.time.measureTimedValue

private val logger = KotlinLogging.logger { }

@Service
class GlobalTocService(
    private val booksService: BooksService,
    private val bookRegistry: BookRegistry,
) {
    @Cacheable("global-toc")
    fun getGlobalTocByLocale(locale: String): GlobalToc = globalTocByLocale(locale)

    private fun globalTocByLocale(locale: String) =
        measureTimedValue {
            TocMergerService.merge(
                booksService.books
                    .asSequence()
                    .filter { it.locale.equals(locale, true) }
                    .mapNotNull { book ->
                        bookRegistry.getBookToc(book)?.let { Pair(book, it) }
                    }.toList(),
            )
        }.also { logger.info { "Build global TOC($locale): ${it.duration}, root pages: ${it.value.pages.size}" } }
            .value

    fun getAvailableLocales() = booksService.getAvailableLocales()

    fun getContent(
        pagePath: String,
        locale: String,
    ): String {
        val toc = getGlobalTocByLocale(locale)
        val page =
            toc.findPageByLocation(pagePath) as? BookPage ?: throw BookPageNotFoundException.byLocationOnly(pagePath)
        return booksService.getBookPageContent(page.book, page.location)
    }
}
