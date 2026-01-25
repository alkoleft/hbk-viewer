/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
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
import ru.alkoleft.v8.platform.app.service.LuceneSearchService
import ru.alkoleft.v8.platform.app.web.controller.dto.SearchResponse

private val logger = KotlinLogging.logger { }

/**
 * Контроллер для полнотекстового поиска
 */
@RestController
@RequestMapping("/api/search")
class SearchController(
    private val luceneSearchService: LuceneSearchService,
) {
    /**
     * Полнотекстовый поиск по содержимому страниц
     */
    @GetMapping
    fun search(
        @RequestParam query: String,
        @RequestParam(defaultValue = "50") limit: Int,
        request: HttpServletRequest,
    ): ResponseEntity<SearchResponse> {
        if (query.isBlank()) {
            return ResponseEntity.badRequest().body(
                SearchResponse(query, emptyList(), 0, 0),
            )
        }

        val locale = request.locale()
        logger.debug { "Полнотекстовый поиск: query='$query', locale='$locale', limit=$limit" }

        if (!luceneSearchService.isIndexReady(locale)) {
            return ResponseEntity.badRequest().body(
                SearchResponse(query, emptyList(), 0, 0),
            )
        }

        val response = luceneSearchService.search(query, locale, limit)
        return ResponseEntity.ok(response)
    }
}
