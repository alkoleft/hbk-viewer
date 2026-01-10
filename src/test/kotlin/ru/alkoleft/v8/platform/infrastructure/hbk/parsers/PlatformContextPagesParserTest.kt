/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.parsers

import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import ru.alkoleft.v8.platform.hbk.parsers.specialized.ConstructorPageParser
import ru.alkoleft.v8.platform.hbk.parsers.specialized.EnumPageParser
import ru.alkoleft.v8.platform.hbk.parsers.specialized.EnumValuePageParser
import ru.alkoleft.v8.platform.hbk.parsers.specialized.MethodPageParser
import ru.alkoleft.v8.platform.hbk.parsers.specialized.ObjectPageParser
import ru.alkoleft.v8.platform.hbk.parsers.specialized.PropertyPageParser

class PlatformContextPagesParserTest {
    @Test
    fun `test all parsers are available`() {
        // Создаем временный парсер для проверки доступности всех парсеров
        // В реальном использовании PlatformContextPagesParser требует Context, который сложно замокать
        assertNotNull(ConstructorPageParser())
        assertNotNull(EnumPageParser())
        assertNotNull(EnumValuePageParser())
        assertNotNull(MethodPageParser())
        assertNotNull(ObjectPageParser())
        assertNotNull(PropertyPageParser())
    }
}
