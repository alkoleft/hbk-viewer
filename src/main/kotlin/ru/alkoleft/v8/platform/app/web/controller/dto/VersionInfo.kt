/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

/**
 * Информация о версиях приложения и платформы 1С.
 *
 * @property application Версия приложения hbk-reader
 * @property platform Версия платформы 1С:Предприятие (может быть null, если не удалось определить)
 */
data class VersionInfo(
    val application: String,
    val platform: String?,
)
