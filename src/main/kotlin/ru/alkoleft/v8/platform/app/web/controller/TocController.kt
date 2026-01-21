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
import org.springframework.web.servlet.support.RequestContextUtils
import ru.alkoleft.v8.platform.app.service.BooksService
import ru.alkoleft.v8.platform.app.web.controller.dto.PageDto
import java.net.URLDecoder
import java.nio.charset.StandardCharsets


private val logger = KotlinLogging.logger { }

/**
 * Контроллер для работы с глобальным оглавлением
 */
@RestController
@RequestMapping("/api/toc/")
class TocController(
    private val booksService: BooksService,
) {
    /**
     * Получает содержимое раздела по индексу
     */
    @GetMapping("/**")
    fun getSectionContent(
        @RequestParam(required = false) depth: Int?,
        request: HttpServletRequest,
    ): ResponseEntity<List<PageDto>> {
        val pagePath = request.pagePath()
        checkDepthParameter(depth)
        val locale = request.locale()

        checkLocale(locale)

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

        val toc = booksService.getGlobalTocByLocale(locale)
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

        val toc = booksService.getGlobalTocByLocale(locale)
        val (page, truck) = toc.findPageWithTruckByLocation(pagePath)

        val pages =
            if (depth != null) {
                page.children.map { page -> PageDto.fromWithDepth(page, depth, truck) }
            } else {
                page.children.map { page -> PageDto.fromLite(page, truck) }
            }
        return ResponseEntity.ok(pages)
    }

    private fun checkLocale(locale: String) {
        val availableLocales = booksService.getAvailableLocales()
        if (locale !in availableLocales) {
            throw IllegalArgumentException(
                "Некорректное значение локали '$locale' доступны следующие значения: '${
                    availableLocales.joinToString("', '")
                }'",
            )
        }
    }

    private fun HttpServletRequest.pagePath(): String? {
        val matches = requestURI.split("/api/toc/")
        return if (matches.size == 2) {
            URLDecoder.decode(matches[1], StandardCharsets.UTF_8).ifEmpty { null }
        } else {
            null
        }
    }

    private fun HttpServletRequest.locale() =
        RequestContextUtils.getLocale(this).language
}
