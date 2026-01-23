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
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.exceptions.InvalidV8HelpLinkException
import ru.alkoleft.v8.platform.app.service.GlobalTocService
import ru.alkoleft.v8.platform.app.web.controller.dto.PageDto
import ru.alkoleft.v8.platform.app.web.controller.dto.V8HelpResolveResult
import ru.alkoleft.v8.platform.hbk.reader.toc.GlobalToc

private val logger = KotlinLogging.logger { }

/**
 * Контроллер для работы с глобальным оглавлением
 */
@RestController
@RequestMapping("/api/toc/")
class TocController(
    private val tocService: GlobalTocService,
) {
    /**
     * Получает содержимое раздела по индексу
     */
    @GetMapping("/**")
    fun getSectionContent(
        @RequestParam(required = false) depth: Int?,
        request: HttpServletRequest,
    ): ResponseEntity<List<PageDto>> {
        val pagePath = request.pagePath("/api/toc/")
        checkDepthParameter(depth)
        val locale = request.locale()

        tocService.checkLocale(locale)

        return if (pagePath == null) {
            getRootPages(locale, depth)
        } else {
            getChildrenPages(pagePath, locale, depth)
        }
    }

    private fun getRootPages(
        locale: String,
        depth: Int?,
    ): ResponseEntity<List<PageDto>> {
        logger.debug { "Запрос глобального оглавления для локали: $locale" }

        val toc = tocService.getGlobalTocByLocale(locale)
        val pages =
            if (depth != null) {
                toc.pages.map { page -> PageDto.fromWithDepth(page, depth) }
            } else {
                toc.pages.map { page -> PageDto.fromLite(page) }
            }
        return ResponseEntity.ok(pages)
    }

    private fun getChildrenPages(
        pagePath: String,
        locale: String,
        depth: Int?,
    ): ResponseEntity<List<PageDto>> {
        logger.debug { "Запрос содержимого раздела: locale=$locale, index=$pagePath" }

        val toc = tocService.getGlobalTocByLocale(locale)
        val (page, truck) = toc.findPageWithTruckByLocation(pagePath)
        val truckRefs = truck.map { it.getRef() }

        val pages =
            if (depth != null) {
                page.getChildren()?.map { page -> PageDto.fromWithDepth(page, depth, truckRefs) }
            } else {
                page.getChildren()?.map { page -> PageDto.fromLite(page, truckRefs) }
            }
        return ResponseEntity.ok(pages)
    }

    /**
     * Резолвинг v8help ссылки
     */
    @GetMapping("/resolve/v8help")
    fun resolveV8HelpLink(
        @RequestParam link: String,
        request: HttpServletRequest
    ): ResponseEntity<V8HelpResolveResult> {
        val locale = request.locale()
        logger.debug { "Резолвинг v8help ссылки: $link для локали: $locale" }

        // Парсинг v8help ссылки
        val (bookName, pageLocation) = parserV8HelpLink(link)

        val toc = tocService.getGlobalTocByLocale(locale)
        val (foundPage, truck) = toc.findPageByLocationAndBookName(bookName, pageLocation)

        val section = truck.firstOrNull()

        return ResponseEntity.ok(
            V8HelpResolveResult(
                sectionTitle = section?.getTitle() ?: "",
                pageLocation = foundPage.getRef(),
                sectionPath = section?.getRef() ?: "",
                pagePath = truck.subList(1, truck.size).map { it.getRef() }
            )
        )
    }

    private fun parserV8HelpLink(link: String): MatchResult.Destructured {
        val v8helpRegex = Regex("^v8help://([^/]+)/(.+)$")
        val matchResult = v8helpRegex.find(link)
            ?: throw InvalidV8HelpLinkException(link)

        return matchResult.destructured
    }

    private fun buildPagePath(globalToc: GlobalToc, pageLocation: String): List<String> {
        val (page, truck) = globalToc.findPageWithTruckByLocation(pageLocation)
        return truck.map { it.getRef() }
    }
}
