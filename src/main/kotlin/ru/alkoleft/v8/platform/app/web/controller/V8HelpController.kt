/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.exceptions.InvalidV8HelpLinkException
import ru.alkoleft.v8.platform.app.exeption.BookNotFoundException
import ru.alkoleft.v8.platform.app.service.BooksService
import ru.alkoleft.v8.platform.app.service.GlobalTocService
import ru.alkoleft.v8.platform.app.web.controller.dto.V8HelpResolveResult

private val logger = KotlinLogging.logger { }

@RestController
@RequestMapping("/api/v8help/")
class V8HelpController(
    private val tocService: GlobalTocService,
    private val bookService: BooksService,
) {
    /**
     * Резолвинг v8help ссылки
     */
    @GetMapping("/resolve")
    fun resolveV8HelpLink(
        @RequestParam link: String,
        request: HttpServletRequest,
    ): ResponseEntity<V8HelpResolveResult> {
        val locale = request.locale()
        logger.debug { "Резолвинг v8help ссылки: $link для локали: $locale" }

        // Парсинг v8help ссылки
        val (bookName, pageLocation) = parserV8HelpLink(link)

        val toc = tocService.getGlobalTocByLocale(locale)
        val (foundPage, truck) = toc.findPageWithTruckByLocationAndBookName(bookName, pageLocation)

        val section = truck.firstOrNull()

        return ResponseEntity.ok(
            V8HelpResolveResult(
                sectionTitle = section?.getTitle() ?: "",
                pageLocation = foundPage.getRef(),
                sectionPath = section?.getRef() ?: "",
                pagePath = truck.subList(1, truck.size).map { it.getRef() },
            ),
        )
    }

    /**
     * Получает содержимое раздела по индексу
     */
    @GetMapping("/content/{bookName}/**")
    fun getV8HelpPageContent(
        @PathVariable bookName: String,
        request: HttpServletRequest,
    ): ResponseEntity<ByteArray> {
        val pageLocation = request.pagePath("/api/v8help/content/$bookName/")
        val locale = request.locale()

        tocService.checkLocale(locale)

        if (pageLocation == null) {
            throw IllegalArgumentException("Не указан путь к странице")
        }

        val book = bookService.findBook(bookName, locale) ?: throw BookNotFoundException.byBookName(bookName)
        return ResponseEntity.ok(bookService.getBookPageContentAsBinary(book, pageLocation))
    }
}

private fun parserV8HelpLink(link: String): MatchResult.Destructured {
    val v8helpRegex = Regex("^v8help://([^/]+)/(.+)$")
    val matchResult =
        v8helpRegex.find(link)
            ?: throw InvalidV8HelpLinkException(link)

    return matchResult.destructured
}
