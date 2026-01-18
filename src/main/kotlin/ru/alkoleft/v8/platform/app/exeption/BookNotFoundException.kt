/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.exeption

class BookNotFoundException(message: String) : Exception(message) {
    companion object {
        fun byFileName(name: String) = BookNotFoundException("Не удалось найти книгу по имени файла '$name'")
        fun byBookName(name: String) = BookNotFoundException("Не удалось найти книгу по имени '$name'")
    }
}