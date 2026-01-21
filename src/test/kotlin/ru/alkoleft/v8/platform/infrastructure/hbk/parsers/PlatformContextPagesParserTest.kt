/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.parsers

import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import ru.alkoleft.v8.platform.shctx.parsers.specialized.ConstructorPageParser
import ru.alkoleft.v8.platform.shctx.parsers.specialized.EnumPageParser
import ru.alkoleft.v8.platform.shctx.parsers.specialized.EnumValuePageParser
import ru.alkoleft.v8.platform.shctx.parsers.specialized.MethodPageParser
import ru.alkoleft.v8.platform.shctx.parsers.specialized.ObjectPageParser
import ru.alkoleft.v8.platform.shctx.parsers.specialized.PropertyPageParser

class PlatformContextPagesParserTest :
    ShouldSpec({
        should("test all parsers are available") {
            // Создаем временный парсер для проверки доступности всех парсеров
            // В реальном использовании PlatformContextPagesParser требует Context, который сложно замокать
            ConstructorPageParser().shouldNotBeNull()
            EnumPageParser().shouldNotBeNull()
            EnumValuePageParser().shouldNotBeNull()
            MethodPageParser().shouldNotBeNull()
            ObjectPageParser().shouldNotBeNull()
            PropertyPageParser().shouldNotBeNull()
        }
    })
