/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.toc

import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.model.Page

class GlobalToc {
    fun findPageWithTruckByLocation(pagePath: String) = TocExtension.findPageWithTruckByLocation(pages, pagePath)

    fun findPageByLocation(location: String) = TocExtension.getPageByContentPath(pages, location, null)?.first

    companion object {
        val EMPTY = GlobalToc(emptyList())
    }

    constructor(pages: List<BookPage>) {
        this.pages = pages
    }

    val pages: List<BookPage>
}

data class BookPage(
    val book: BookInfo,
    val pageTitle: String,
    override val location: String,
    val subPages: List<BookPage>? = null,
) : Page {
    override fun getTitle() = pageTitle

    override fun getChildren() = subPages
}
