/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform

import io.kotest.core.spec.style.ShouldSpec
import kotlin.io.path.Path

fun ShouldSpec.hbkFilesDirectory() = "/opt/1cv8/x86_64/8.3.21.1895"

fun ShouldSpec.hbkFilesPath() = Path(hbkFilesDirectory())
