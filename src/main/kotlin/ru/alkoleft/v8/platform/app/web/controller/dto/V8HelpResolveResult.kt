/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * DTO для результата резолвинга v8help ссылки
 */
data class V8HelpResolveResult(
    val sectionTitle: String,
    val pageLocation: String,
    val sectionPath: String,
    val pagePath: List<String>,
)
