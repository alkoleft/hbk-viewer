/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.exceptions

/**
 * Исключение при отсутствии книги
 */
class BookNotFoundException(
    bookName: String,
) : RuntimeException("Книга '$bookName' не найдена")

/**
 * Исключение при отсутствии страницы
 */
class PageNotFoundException(
    pageLocation: String,
) : RuntimeException("Страница '$pageLocation' не найдена")

/**
 * Исключение при неверном формате v8help ссылки
 */
class InvalidV8HelpLinkException(
    link: String,
) : RuntimeException("Неверный формат v8help ссылки: '$link'")
