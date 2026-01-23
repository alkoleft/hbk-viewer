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
import ru.alkoleft.v8.platform.app.service.BooksService
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.app.web.controller.dto.FileContent
import ru.alkoleft.v8.platform.app.web.controller.dto.PageDto
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

private val logger = KotlinLogging.logger { }

/**
 * Контроллер для работы с книгами
 */
@RestController
@RequestMapping("/api/books")
class BooksController(
    private val booksService: BooksService,
) {
    /**
     * Получает список всех книг
     */
    @GetMapping
    fun getBooks(): ResponseEntity<List<BookInfo>> {
        logger.debug { "Запрос списка книг" }
        return ResponseEntity.ok(booksService.books)
    }

    /**
     * Получает содержимое страницы из книги
     */
    @GetMapping("/{book}/children/**")
    fun getPageChildren(
        @PathVariable book: String,
        @RequestParam(required = false) depth: Int?,
        request: HttpServletRequest,
    ): ResponseEntity<List<PageDto>> {
        val pagePath = request.pagePath(book)
        logger.debug { "Запрос дочерных элементов файла: $book, htmlPath: $pagePath" }
        checkDepthParameter(depth)

        val toc = booksService.bookToc(book)

        val (page, truck) = toc.findPageWithTruckByLocation(pagePath)
        val truckRefs = truck.map { it.getRef() }

        val pages =
            if (depth != null) {
                page.getChildren()?.map { PageDto.fromWithDepth(it, depth, truckRefs) }
            } else {
                page.getChildren()?.map { PageDto.fromLite(it, truckRefs) }
            }
        return ResponseEntity.ok(pages)
    }

    /**
     * Получает содержимое страницы из книги
     */
    @GetMapping("/{book}/children")
    fun getPageBookChildren(
        @PathVariable book: String,
        @RequestParam(required = false) depth: Int?,
    ): ResponseEntity<List<PageDto>> {
        checkDepthParameter(depth)

        val toc = booksService.bookToc(book)
        val pages =
            if (depth != null) {
                toc.pages.map { page -> PageDto.fromWithDepth(page, depth) }
            } else {
                toc.pages.map { page -> PageDto.fromLite(page) }
            }

        return ResponseEntity.ok(pages)
    }

    /**
     * Получает содержимое страницы из книги
     */
    @GetMapping("/{book}/**")
    fun getPageContent(
        @PathVariable book: String,
        request: HttpServletRequest,
    ): ResponseEntity<FileContent> {
        val page = request.pagePath(book)
        logger.debug { "Запрос содержимого: book=$book, page=$page" }

        val pageInfo = booksService.getBookPageInfo(book, page)
        val content = booksService.getBookPageContent(book, page)

        return ResponseEntity.ok(
            FileContent(
                filename = book,
                pageName = pageInfo.getTitle(),
                content = content,
            ),
        )
    }

    private fun HttpServletRequest.pagePath(book: String): String {
        val matches = requestURI.split("/books/$book/")
        return URLDecoder.decode(matches[1], StandardCharsets.UTF_8)
    }
}
