/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.service.LuceneSearchService
import ru.alkoleft.v8.platform.app.web.controller.dto.IndexingStatus

@RestController
@RequestMapping("/api/indexing")
class IndexingController(
    private val luceneSearchService: LuceneSearchService
) {
    
    @GetMapping("/status")
    fun getIndexingStatus(): ResponseEntity<IndexingStatus> {
        return ResponseEntity.ok(luceneSearchService.getIndexingStatus())
    }
}
