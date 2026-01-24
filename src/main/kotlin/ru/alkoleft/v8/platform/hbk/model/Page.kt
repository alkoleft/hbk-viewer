/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.model

const val EMPTY_PAGE_LOCATION = "__empty_pl_"

/**
 * Представляет страницу документации в HBK файле.
 *
 * Каждая страница содержит заголовок на двух языках, путь к HTML файлу
 * и список дочерних страниц, формируя иерархическую структуру документации.
 *
 * @property title Заголовок страницы на двух языках
 * @property getRef Путь к HTML файлу в архиве
 * @property subRecords Список дочерних страниц
 */
data class TocRecord(
    val title: DoubleLanguageString,
    override val location: String,
    val subRecords: MutableList<TocRecord> = mutableListOf(),
) : Page {
    override fun getTitle() = title.get()

    override fun getChildren() = subRecords

    override fun getRef() = location
}

/**
 * Строка на двух языках (русский и английский).
 *
 * Используется для представления названий и заголовков в документации
 * платформы 1С:Предприятие, которая поддерживает двуязычность.
 *
 * @property en Английская версия строки
 * @property ru Русская версия строки
 */
data class DoubleLanguageString(
    val en: String,
    val ru: String,
) {
    fun get() = ru.ifEmpty { en }
}

interface Page {
    val location: String

    fun getTitle(): String

    fun getChildren(): List<Page>?

    fun getRef(): String
}
