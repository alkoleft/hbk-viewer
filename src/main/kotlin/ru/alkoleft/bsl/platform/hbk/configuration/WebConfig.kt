/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter

/**
 * Конфигурация CORS для веб-приложения.
 *
 * Разрешает запросы с фронтенда, работающего на localhost:3000.
 */
@Configuration
class WebConfig {
    @Bean
    fun corsFilter(): CorsFilter {
        val source = UrlBasedCorsConfigurationSource()
        val config =
            CorsConfiguration().apply {
                allowCredentials = true
                addAllowedOriginPattern("http://localhost:*")
                addAllowedOriginPattern("http://127.0.0.1:*")
                addAllowedHeader("*")
                addAllowedMethod("*")
            }
        source.registerCorsConfiguration("/api/**", config)
        return CorsFilter(source)
    }
}
