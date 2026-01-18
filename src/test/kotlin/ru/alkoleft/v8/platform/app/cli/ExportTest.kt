/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.cli

import io.kotest.core.spec.style.ShouldSpec
import ru.alkoleft.v8.platform.app.service.ExportService
import ru.alkoleft.v8.platform.hbkFilesPath
import java.nio.file.Path

class ExportTest : ShouldSpec({
    val outputDir: Path = Path.of("/tmp", "export_all")
    val service = ExportService()

    should("exportBook") {
        service.exportBookToMkDocs(hbkFilesPath().resolve("shcntx_ru.hbk"), outputDir)
    }
})