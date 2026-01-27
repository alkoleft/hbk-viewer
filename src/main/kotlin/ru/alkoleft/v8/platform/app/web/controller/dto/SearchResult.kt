/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * DTO для результата полнотекстового поиска.
 *
 * @property title Заголовок страницы
 * @property location Путь к странице
 * @property bookName Название книги
 * @property score Релевантность результата
 * @property highlights Фрагменты текста с подсветкой
 * @property breadcrumbs Иерархия разделов (путь к странице)
 */
data class SearchResult(
    val title: String,
    val location: String,
    val bookName: String,
    val score: Float,
    val highlights: List<String>,
    val breadcrumbs: List<String> = emptyList(),
)

/**
 * DTO для ответа на поисковый запрос.
 *
 * @property query Поисковый запрос
 * @property results Список результатов поиска
 * @property totalHits Общее количество найденных документов
 * @property searchTime Время выполнения поиска в миллисекундах
 */
data class SearchResponse(
    val query: String,
    val results: List<SearchResult>,
    val totalHits: Long,
    val searchTime: Long,
)
