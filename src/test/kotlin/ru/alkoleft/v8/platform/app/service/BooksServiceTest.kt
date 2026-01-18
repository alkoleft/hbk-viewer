/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldNotBeEmpty
import ru.alkoleft.v8.platform.app.config.ApplicationConfiguration
import ru.alkoleft.v8.platform.app.storage.BookRegistry
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbkFilesDirectory

class BooksServiceTest : ShouldSpec({
    val reader = HbkContentReader()
    val bookService = BooksService(
        BookRegistry(
            reader, ApplicationConfiguration(hbkFilesDirectory())
        ), reader
    )

    should("load books") {
        bookService.books.shouldNotBeEmpty()
    }

    should("load global toc") {
        bookService.globalTocRu.pages.shouldNotBeEmpty()
    }
})