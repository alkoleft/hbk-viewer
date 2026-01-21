/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.formatters

import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.nio.file.Path

interface TocFormatter {
    fun export(
        toc: Toc,
        output: Path,
    )
}
