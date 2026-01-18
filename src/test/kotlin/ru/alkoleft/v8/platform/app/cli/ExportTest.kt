/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.cli

import ru.alkoleft.v8.platform.app.service.ExportService
import java.nio.file.Path
import kotlin.io.path.Path
import kotlin.test.Test

class ExportTest {
    val platformPath = Path("/opt/1cv8/x86_64/8.3.21.1895")
    val outputDir: Path = Path.of("/tmp", "export_all")
    val service = ExportService()

    @Test
    fun exportBook() {
        service.exportBookToMkDocs(platformPath.resolve("shcntx_ru.hbk"), outputDir)
    }
}