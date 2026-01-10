/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk

import org.junit.jupiter.api.Assumptions
import org.junit.jupiter.api.Test
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import java.nio.file.Files
import kotlin.io.path.Path

class HbkReaderTest {
    @Test
    fun read() {
        val hbkPath = Path("/opt/1cv8/x86_64/8.3.27.1326/shcntx_ru.hbk")
        Assumptions.assumeTrue(Files.exists(hbkPath), "Интеграционный тест: HBK файл не найден по пути $hbkPath")
        val reader = HbkContentReader()
        reader.read(hbkPath) {
            println("Success")
        }
    }

//    @Test
//    fun readPlatformContextGrabber(@TempDir path: Path){
//        val parser = PlatformContextGrabber(Path("/opt/1cv8/x86_64/8.3.27.1326/shcntx_ru.hbk"), path)
//        parser.parse()
//    }
}
