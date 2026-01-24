/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.shctx

import io.github.oshai.kotlinlogging.KotlinLogging
import ru.alkoleft.v8.platform.hbk.model.TocRecord
import ru.alkoleft.v8.platform.shctx.models.ConstructorInfo
import ru.alkoleft.v8.platform.shctx.models.EnumInfo
import ru.alkoleft.v8.platform.shctx.models.MethodInfo
import ru.alkoleft.v8.platform.shctx.models.ObjectInfo
import ru.alkoleft.v8.platform.shctx.models.PageType
import ru.alkoleft.v8.platform.shctx.models.PropertyInfo
import ru.alkoleft.v8.platform.shctx.parsers.PlatformContextPagesParser

private val logger = KotlinLogging.logger { }

private val CATALOG_PAGE_PATTERN = """/catalog\d+\.html""".toRegex()

class PagesVisitor(
    private val parser: PlatformContextPagesParser,
) {
    fun collectPages(pages: List<TocRecord>): RootPages {
        var globalContext: TocRecord? = null
        val enums = mutableListOf<TocRecord>()
        val types = mutableListOf<TocRecord>()

        pages
            .filter { it.location.isNotEmpty() }
            .forEach {
                val pageType = rootPageType(it)
                when (pageType) {
                    PageType.GLOBAL_CONTEXT -> globalContext = it
                    PageType.ENUMS_CATALOG -> enums += it
                    PageType.TYPES_CATALOG -> types += it
                }
            }
        return object : RootPages {
            override val globalContext: TocRecord = globalContext!!
            override val enums: List<TocRecord> = enums.toList()
            override val types: List<TocRecord> = types.toList()
        }
    }

    interface RootPages {
        val globalContext: TocRecord
        val enums: List<TocRecord>
        val types: List<TocRecord>
    }

    /**
     * Обрабатывает страницу перечисления.
     *
     * @param page Страница перечисления
     * @param parser Парсер для обработки страниц
     */
    fun visitEnumPage(page: TocRecord): EnumInfo {
        val values =
            page.subRecords
                .filter { it.location.contains("/properties/") }
                .map { parser.parseEnumValuePage(it) }
        return parser.parseEnumPage(page).apply { this.values.addAll(values) }
    }

    /**
     * Обрабатывает страницу типа (объекта).
     *
     * @param page Страница типа
     * @param parser Парсер для обработки страниц
     */
    fun visitTypePage(page: TocRecord): ObjectInfo {
        val objectInfo = parser.parseObjectPage(page)
        var properties: Sequence<PropertyInfo>? = null
        var methods: Sequence<MethodInfo>? = null
        var constructors: Sequence<ConstructorInfo>? = null

        for (subPage in page.subRecords) {
            when (subPage.title.en) {
                "Свойства" -> properties = visitPropertiesPage(subPage)
                "Методы" -> methods = visitMethodsPage(subPage)
                "Конструкторы" -> constructors = getConstructorsFromPage(subPage)
            }
        }
        return objectInfo.copy(
            methods = methods?.toList(),
            properties = properties?.toList(),
            constructors = constructors?.toList(),
        )
    }

    fun visitPropertiesPage(page: TocRecord) =
        page.subRecords
            .asSequence()
            .filter { it.location.contains("/properties/") } // TODO проверить на обязательность
            .filter { !it.title.ru.startsWith("<") }
            .map { parser.parsePropertyPage(it) }

    fun visitMethodsPage(page: TocRecord) =
        page.subRecords
            .asSequence()
            .map { parser.parseMethodPage(it) }

    private fun getConstructorsFromPage(page: TocRecord) =
        page.subRecords
            .asSequence()
            .filter { it.location.contains("/ctors/") }
            .map { parser.parseConstructorPage(it) }
}

private fun rootPageType(page: TocRecord) =
    when {
        isGlobalContextPage(page) -> PageType.GLOBAL_CONTEXT
        isEnumCatalog(page) -> PageType.ENUMS_CATALOG
        else -> PageType.TYPES_CATALOG
    }

private fun isGlobalContextPage(page: TocRecord): Boolean = page.location.contains("Global context.html")

private fun isCatalogPage(page: TocRecord) = CATALOG_PAGE_PATTERN.find(page.location) != null

private fun isEnumCatalog(page: TocRecord) = page.title.en == "Системные наборы значений" || page.title.en == "Системные перечисления"

suspend fun SequenceScope<TocRecord>.drillDown(base: TocRecord) {
    base.subRecords.forEach { child ->
        when {
            child.location.isEmpty() -> {}
            isCatalogPage(child) -> drillDown(child)
            else -> yield(child)
        }
    }
}
