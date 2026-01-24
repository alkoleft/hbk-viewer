/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.service.BooksService
import ru.alkoleft.v8.platform.app.service.VersionService
import ru.alkoleft.v8.platform.app.web.controller.dto.AppInfo

/**
 * Контроллер для получения информации о приложении
 */
@RestController
@RequestMapping("/api/app")
class AppController(
    private val booksService: BooksService,
    private val versionService: VersionService,
) {
    /**
     * Получает информацию о приложении: версии, доступные локали
     */
    @GetMapping("/info")
    fun getAppInfo(): ResponseEntity<AppInfo> =
        ResponseEntity.ok(
            AppInfo(
                version = versionService.versionsInfo,
                availableLocales = booksService.getAvailableLocales(),
            ),
        )
}
