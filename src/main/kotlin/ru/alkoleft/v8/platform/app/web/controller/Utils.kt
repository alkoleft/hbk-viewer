/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

fun checkDepthParameter(depth: Int?) {
    if (depth != null && depth < 0) {
        throw IllegalArgumentException("Некорректное значение параметра 'depth'")
    }
}
