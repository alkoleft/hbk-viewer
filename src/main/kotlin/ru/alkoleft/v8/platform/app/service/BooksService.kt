/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.cache.annotation.Cacheable
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import ru.alkoleft.v8.platform.app.exeption.BookNotFoundException
import ru.alkoleft.v8.platform.app.exeption.BookPageNotFoundException
import ru.alkoleft.v8.platform.app.storage.BookRegistry
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import kotlin.io.path.Path

private val logger = KotlinLogging.logger { }

@Service
class BooksService(
    private val bookRegistry: BookRegistry,
    private val hbkContentReader: HbkContentReader,
) {
    val books: List<BookInfo> = bookRegistry.books

    fun getBookPageContent(hbkFile: String, pagePath: String): String {
        val bookInfo = getBookInfo(hbkFile)
        return hbkContentReader.getPageText(Path(bookInfo.path), pagePath.normalizePath())
    }

    fun getBookPageInfo(hbkFile: String, pagePath: String): Page {
        val toc = bookToc(hbkFile)
        val normalizedPath = pagePath.normalizePath()

        return toc.findPageByHtmlPath(normalizedPath) ?: throw BookPageNotFoundException(hbkFile, pagePath)
    }

    fun bookToc(hbkFile: String) =
        bookToc(getBookInfo(hbkFile))

    @Cacheable(value = ["tocCache"], key = "#book.path")
    fun bookToc(book: BookInfo): Toc {
        logger.debug { "Чтение оглавления из файла ${book.path}" }
        return hbkContentReader.readToc(Path(book.path))
    }

    private fun getBookInfo(hbkFile: String) =
        bookRegistry.getBookInfo(hbkFile) ?: throw BookNotFoundException(hbkFile)

    @EventListener(ApplicationReadyEvent::class)
    private fun loadBooks() {
        bookRegistry.books
    }

    private fun String.normalizePath(): String =
        if (startsWith("/")) {
            substring(1)
        } else {
            this
        }
}