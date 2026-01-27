/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.dto

import java.time.LocalDateTime

enum class IndexingState {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    FAILED,
}

data class LocaleIndexingStatus(
    val locale: String,
    val state: IndexingState,
    val progress: Int = 0,
    val totalDocuments: Int = 0,
    val indexedDocuments: Int = 0,
    val startTime: LocalDateTime? = null,
    val endTime: LocalDateTime? = null,
    val errorMessage: String? = null,
)

data class IndexingStatus(
    val locales: List<LocaleIndexingStatus>,
    val overallProgress: Int = 0,
    val isIndexingInProgress: Boolean = false,
)
