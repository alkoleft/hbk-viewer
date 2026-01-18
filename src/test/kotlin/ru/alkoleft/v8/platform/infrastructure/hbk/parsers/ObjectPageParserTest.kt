/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.parsers

import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldNotBeEmpty
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.kotest.matchers.string.shouldNotBeEmpty
import org.junit.jupiter.api.assertDoesNotThrow
import ru.alkoleft.v8.platform.shctx.parsers.specialized.ObjectPageParser

class ObjectPageParserTest : ShouldSpec({
    val parser = ObjectPageParser()

    should("parse COMSafeArray object correctly") {
        // Arrange
        val html = javaClass.getResourceAsStream("/objects/COMSafeArray.html")!!

        // Act
        val result =
            assertDoesNotThrow {
                parser.parse(html)
            }

        // Assert
        "COMSafeArray" shouldBe result.nameRu
        "COMSafeArray" shouldBe result.nameEn
        result.description.shouldNotBeEmpty()
        result.description.shouldContain("Объектная оболочка над многомерным массивом SAFEARRAY")

        // Проверяем пример
        result.example.shouldNotBeNull()
        result.example.shouldContain("COMSafeArray")

        // Проверяем связанные объекты
        result.relatedObjects.shouldNotBeNull()
        result.relatedObjects.shouldNotBeEmpty()
    }

    should("parse CallbackDescription object correctly") {
        // Arrange
        val html = javaClass.getResourceAsStream("/objects/CallbackDescription.html")!!

        // Act
        val result =
            assertDoesNotThrow {
                parser.parse(html)
            }

        // Assert
        "ОписаниеОповещения" shouldBe result.nameRu
        "CallbackDescription" shouldBe result.nameEn
        result.description.shouldNotBeEmpty()
        result.description.shouldContain("Используется для описания вызова процедуры")

        // Проверяем пример
        result.example.shouldNotBeNull()
        result.example.shouldContain("ОписаниеОповещения")

        // Проверяем связанные объекты
        result.relatedObjects.shouldNotBeNull()
        result.relatedObjects.shouldNotBeEmpty()
    }

    should("parse complex object correctly") {
        // Arrange
        val html = javaClass.getResourceAsStream("/objects/object130.html")!!

        // Act
        val result =
            assertDoesNotThrow {
                parser.parse(html)
            }

        // Assert
        "СправочникОбъект.<Имя справочника>" shouldBe result.nameRu
        "CatalogObject.<Catalog name>" shouldBe result.nameEn
        result.description.shouldNotBeEmpty()
        result.description.shouldContain("Предназначен для чтения, изменения, добавления и удаления элементов")

        // Проверяем связанные объекты
        result.relatedObjects.shouldNotBeNull()
        result.relatedObjects.shouldNotBeEmpty()
    }
})
