/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.servlet.support.RequestContextUtils
import ru.alkoleft.v8.platform.app.service.GlobalTocService
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import kotlin.text.ifEmpty

fun HttpServletRequest.pagePath(prefix: String): String? {
    val matches = requestURI.split(prefix)
    return if (matches.size == 2) {
        URLDecoder.decode(matches[1], StandardCharsets.UTF_8).ifEmpty { null }
    } else {
        null
    }
}

fun HttpServletRequest.locale(): String = RequestContextUtils.getLocale(this).language

fun GlobalTocService.checkLocale(locale: String) {
    val availableLocales = getAvailableLocales()
    if (locale !in availableLocales) {
        throw IllegalArgumentException(
            "Некорректное значение локали '$locale' доступны следующие значения: '${
                availableLocales.joinToString("', '")
            }'",
        )
    }
}
