/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader.toc

import ru.alkoleft.v8.platform.app.exeption.BookPageNotFoundException
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.model.EMPTY_PAGE_LOCATION
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.model.PageBuilder

class GlobalToc {
    fun findPageWithTruckByLocation(pagePath: String) = TocExtension.findPageWithTruckByLocation(pages, pagePath)

    fun findPageByLocation(location: String) = TocExtension.getPageByContentPath(pages, location, null)?.first

    fun findPageWithTruckByLocationAndBookName(
        bookName: String,
        location: String,
    ) = TocExtension
        .findPage(pages, mutableListOf()) { page ->
            page.location == location && (page as BookPage).book.meta!!.bookName == bookName
        }?.let { it.first to it.second!! }
        ?: throw BookPageNotFoundException.byLocationOnly(location)

    fun findPageByLocationAndBookName(
        bookName: String,
        location: String,
    ) = TocExtension
        .findPage(pages, null) { page ->
            page.location == location && (page as BookPage).book.meta!!.bookName == bookName
        }?.first
        ?: throw BookPageNotFoundException.byLocationOnly(location)

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
    val locationIndex: Int = 0,
    val subPages: List<BookPage>? = null,
) : Page {
    override fun getTitle() = pageTitle

    override fun getChildren() = subPages

    override fun getRef() =
        location.ifEmpty { EMPTY_PAGE_LOCATION } +
            if (locationIndex == 0) {
                ""
            } else {
                locationIndex.toString()
            }

    companion object {
        fun fromPageBuilder(builder: PageBuilder): BookPage {
            val childrenPages = builder.children.map(::fromPageBuilder)
            return BookPage(
                builder.book,
                builder.title,
                builder.location,
                builder.locationIndex,
                childrenPages,
            )
        }
    }
}
