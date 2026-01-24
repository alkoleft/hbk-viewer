/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.model

import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo

class PageBuilder(
    var book: BookInfo,
    val title: String,
    val location: String,
    var locationIndex: Int = 0,
    val children: MutableList<PageBuilder> = mutableListOf(),
) {
    fun getChildren(name: String) = children.find { it.title.equals(name, true) }

    fun add(
        page: TocRecord,
        book: BookInfo,
    ): PageBuilder {
        val newPage = PageBuilder(book, page.title.get(), page.location)
        children.add(newPage)
        return newPage
    }

    fun toPage(): TocRecord {
        val childrenPages = children.map { it.toPage() }.toMutableList()
        return TocRecord(DoubleLanguageString(title, ""), location, childrenPages)
    }
}
