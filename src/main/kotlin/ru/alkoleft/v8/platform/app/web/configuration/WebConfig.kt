/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.Resource
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import org.springframework.web.servlet.resource.PathResourceResolver
import java.io.IOException

/**
 * Конфигурация веб-приложения.
 *
 * Настраивает:
 * - CORS для API запросов
 * - Обслуживание статических ресурсов (web UI)
 * - SPA роутинг (fallback на index.html для всех не-API маршрутов)
 */
@Configuration
class WebConfig : WebMvcConfigurer {
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

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry
            .addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(
                object : PathResourceResolver() {
                    @Throws(IOException::class)
                    override fun getResource(
                        resourcePath: String,
                        location: Resource,
                    ): Resource? {
                        // Сначала пытаемся найти запрошенный ресурс
                        val resource = super.getResource(resourcePath, location)
                        // Если ресурс найден, возвращаем его
                        if (resource != null) {
                            return resource
                        }
                        // Если ресурс не найден, возвращаем index.html для SPA роутинга
                        // (контроллеры обрабатываются первыми, поэтому API запросы не попадут сюда)
                        return super.getResource("index.html", location)
                    }
                },
            )
    }
}
