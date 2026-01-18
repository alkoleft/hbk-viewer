/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import ru.alkoleft.v8.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc

private val logger = KotlinLogging.logger { }

/**
 * Сервис для работы с путями и навигацией по структуре HBK файлов.
 *
 * Предоставляет функциональность для:
 * - Нормализации путей HTML страниц
 * - Поиска путей к страницам в иерархии оглавления
 * - Поиска страниц по различным критериям
 */
@Service
class HbkPathService {
    /**
     * Нормализует htmlPath, убирая ведущий слэш для консистентности.
     * В HBK файлах htmlPath хранится без ведущего слэша.
     *
     * @param htmlPath Путь к HTML странице
     * @return Нормализованный путь
     */
    fun normalizeHtmlPath(htmlPath: String): String =
        if (htmlPath.startsWith("/")) {
            htmlPath.substring(1)
        } else {
            htmlPath
        }

    /**
     * Валидирует и нормализует путь, защищая от path traversal атак.
     *
     * @param htmlPath Путь к HTML странице
     * @return Нормализованный путь
     * @throws IllegalArgumentException если путь содержит недопустимые символы
     */
    fun validateAndNormalizeHtmlPath(htmlPath: String): String {
        val normalized = normalizeHtmlPath(htmlPath)

        // Защита от path traversal
        if (normalized.contains("..") || normalized.contains("//")) {
            throw IllegalArgumentException("Недопустимый путь: $htmlPath")
        }

        return normalized
    }

    /**
     * Находит путь от корня до указанной страницы в оглавлении.
     *
     * @param toc Оглавление
     * @param targetPage Целевая страница
     * @return Список индексов пути от корня до страницы, или null если страница не найдена
     */
    fun findPathToPage(
        toc: Toc,
        targetPage: Page,
    ): List<Int>? {
        fun searchInPages(
            pages: List<Page>,
            currentPath: List<Int>,
        ): List<Int>? {
            for ((index, page) in pages.withIndex()) {
                if (page === targetPage) {
                    return currentPath + index
                }
                val found = searchInPages(page.children, currentPath + index)
                if (found != null) {
                    return found
                }
            }
            return null
        }
        return searchInPages(toc.pages, emptyList())
    }

    /**
     * Находит страницу по htmlPath в иерархии оглавления.
     *
     * @param toc Оглавление
     * @param htmlPath Путь к HTML странице
     * @return Найденная страница или null
     */
    fun findPageByHtmlPath(
        toc: Toc,
        htmlPath: String,
    ): Page? {
        val normalizedPath = normalizeHtmlPath(htmlPath)
        val page = toc.findPageByHtmlPath(normalizedPath)
        if (page != null) {
            logger.debug { "Страница найдена по нормализованному пути: '$normalizedPath'" }
            return page
        }
        // Если не найдено с нормализованным путем, пробуем исходный
        val pageByOriginal = toc.findPageByHtmlPath(htmlPath)
        if (pageByOriginal != null) {
            logger.debug { "Страница найдена по исходному пути: '$htmlPath'" }
            return pageByOriginal
        }
        logger.debug { "Страница не найдена ни по нормализованному пути '$normalizedPath', ни по исходному '$htmlPath'" }
        return null
    }

    /**
     * Парсит строковое представление пути (например, "0,2,1") в список индексов.
     *
     * @param pathString Строковое представление пути
     * @return Список индексов
     * @throws IllegalArgumentException если путь невалиден
     */
    fun parsePathString(pathString: String): List<Int> {
        val pathList =
            pathString
                .split(',')
                .mapNotNull { it.trim().toIntOrNull() }

        if (pathList.isEmpty()) {
            throw IllegalArgumentException("Путь не может быть пустым: $pathString")
        }

        if (pathList.any { it < 0 }) {
            throw IllegalArgumentException("Индексы пути не могут быть отрицательными: $pathString")
        }

        return pathList
    }

    /**
     * Получает htmlPath первой страницы из оглавления файла.
     *
     * @param toc Оглавление
     * @return htmlPath первой страницы
     * @throws PlatformContextLoadException если оглавление пусто
     */
    fun getFirstPageHtmlPath(toc: Toc): String =
        if (toc.pages.isNotEmpty()) {
            toc.pages.first().htmlPath
        } else {
            throw PlatformContextLoadException("Оглавление файла пусто")
        }
}
