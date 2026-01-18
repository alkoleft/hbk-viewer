/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.exeption

class BookPageNotFoundException(book: String, pagePath: String) :
    Exception("Не удалось найти страницу по пути '$pagePath' в книге '$book'")