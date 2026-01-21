/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * Информация о приложении
 *
 * @property version Информация о версиях
 * @property availableLocales Доступные локали
 */
data class AppInfo(
    val version: VersionInfo,
    val availableLocales: List<String>,
)
