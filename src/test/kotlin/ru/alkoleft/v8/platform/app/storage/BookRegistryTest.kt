/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.storage

import io.kotest.core.spec.style.ShouldSpec
import ru.alkoleft.v8.platform.app.config.ApplicationProperties
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbkFilesDirectory

class BookRegistryTest :
    ShouldSpec({
        var bookRegistry =
            BookRegistry(
                HbkContentReader(),
                ApplicationProperties(hbkFilesDirectory()),
            )
        should("load books") {
            bookRegistry.getAllFiles()
        }
    })
