/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.exeption

class BookPageNotFoundException(
    message: String,
) : Exception(message) {
    companion object {
        fun byBookAndLocation(
            book: String,
            location: String,
        ) = BookPageNotFoundException("Не удалось найти страницу по пути '$location' в книге '$book'")

        fun byLocationOnly(location: String) = BookPageNotFoundException("Не удалось найти страницу по пути '$location'")
    }
}
