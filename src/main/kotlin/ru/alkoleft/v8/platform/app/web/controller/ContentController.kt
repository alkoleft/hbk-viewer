/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.service.GlobalTocService

@RestController
@RequestMapping("/api/content/")
class ContentController(
    private val tocService: GlobalTocService,
) {
    /**
     * Получает содержимое раздела по индексу
     */
    @GetMapping("/**")
    fun getPageContent(
        @RequestParam(required = false) depth: Int?,
        request: HttpServletRequest,
    ): ResponseEntity<String> {
        val pagePath = request.pagePath("/api/content/")
        checkDepthParameter(depth)
        val locale = request.locale()

        tocService.checkLocale(locale)

        if (pagePath == null) {
            throw IllegalArgumentException("Не указан путь к странице")
        }

        return ResponseEntity.ok(tocService.getContent(pagePath, locale))
    }
}
