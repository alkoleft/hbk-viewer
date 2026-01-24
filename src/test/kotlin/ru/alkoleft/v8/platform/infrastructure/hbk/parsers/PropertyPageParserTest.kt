/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.parsers

import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.shouldBe
import org.assertj.core.api.Assertions
import ru.alkoleft.v8.platform.shctx.models.PropertyInfo
import ru.alkoleft.v8.platform.shctx.parsers.specialized.PropertyPageParser
import java.io.FileInputStream
import java.nio.file.Paths

class PropertyPageParserTest :
    ShouldSpec({
        fun parseFile(
            fileName: String,
            directory: String = "global-properties",
        ): PropertyInfo {
            val parser = PropertyPageParser()
            FileInputStream(Paths.get("src/test/resources/$directory/$fileName").toFile()).use { inputStream ->
                return parser.parse(inputStream)
            }
        }

        should("CorrectlyParseCatalogs336Html") {
            val info = parseFile("Catalogs336.html")

            Assertions.assertThat(info.nameRu).isEqualTo("Справочники")
            Assertions.assertThat(info.nameEn).isEqualTo("Catalogs")
            Assertions.assertThat(info.readonly).isTrue()
            Assertions.assertThat(info.typeName).isEqualTo("СправочникиМенеджер")
            Assertions
                .assertThat(info.description)
                .isEqualTo("Используется для доступа к определенным в конфигурации справочникам.")
            Assertions.assertThat(info.relatedObjects).hasSize(1)
            Assertions.assertThat(info.relatedObjects?.get(0)?.name).isEqualTo("СправочникиМенеджер")
            Assertions.assertThat(info.relatedObjects?.get(0)?.href).contains("CatalogsManager.html")
            Assertions
                .assertThat(info.relatedObjects?.get(0)?.href)
                .isEqualTo("v8help://SyntaxHelperContext/objects/catalog125/catalog126/CatalogsManager.html")
        }

        should("CorrectlyParseURLExternalDataStorage12781Html") {
            val info = parseFile("URLExternalDataStorage12781.html")

            Assertions.assertThat(info.nameRu).isEqualTo("ХранилищеВнешнихДанныхНавигационныхСсылок")
            Assertions.assertThat(info.nameEn).isEqualTo("URLExternalDataStorage")
            Assertions.assertThat(info.readonly).isTrue()
            Assertions
                .assertThat(info.typeName)
                .isEqualTo("СтандартноеХранилищеНастроекМенеджер,ХранилищеНастроекМенеджер.<Имя хранилища>")
            Assertions
                .assertThat(info.description)
                .contains("Предоставляет доступ к хранилищу внешних данных навигационных ссылок.")
            Assertions.assertThat(info.relatedObjects).isNullOrEmpty()
        }

        should("CorrectlyParseWorkingDateUse1182Html") {
            val info = parseFile("WorkingDateUse1182.html")

            Assertions.assertThat(info.nameRu).isEqualTo("ИспользованиеРабочейДаты")
            Assertions.assertThat(info.nameEn).isEqualTo("WorkingDateUse")
            Assertions.assertThat(info.readonly).isTrue()
            Assertions.assertThat(info.typeName).isEqualTo("РежимРабочейДаты")
            Assertions.assertThat(info.description).contains("Определяет режим использования рабочей даты.")
            Assertions.assertThat(info.relatedObjects?.map { it.name }).contains("РабочаяДата")
        }

        should("CorrectlyParseXDTOFactory4693Html") {
            val info = parseFile("XDTOFactory4693.html")

            Assertions.assertThat(info.nameRu).isEqualTo("ФабрикаXDTO")
            Assertions.assertThat(info.nameEn).isEqualTo("XDTOFactory")
            Assertions.assertThat(info.readonly).isTrue()
            Assertions.assertThat(info.typeName).isEqualTo("ФабрикаXDTO")
            Assertions.assertThat(info.relatedObjects).isNullOrEmpty()
            info.description shouldBe
                """
                Фабрика XDTO, содержащая набор пакетов XDTO, соответствующих контексту выполнения:
                * для тонкого клиента, мобильного клиента и мобильного сервера - предопределенные пакеты (например, пакет типов XML-схемы)
                * для толстого клиента и сервера - все пакеты XDTO, имеющиеся в конфигурации, а также все предопределенные пакеты (например, пакет типов XML-схемы).
                """.trimIndent()
        }

        should("CorrectlyParseAttributes4786Html") {
            val info = parseFile("Attributes4786.html", "object-properties")

            Assertions.assertThat(info.nameRu).isEqualTo("Атрибуты")
            Assertions.assertThat(info.nameEn).isEqualTo("Attributes")
            Assertions.assertThat(info.readonly).isTrue()
            Assertions.assertThat(info.typeName).isEqualTo("КоллекцияАтрибутовDOM")
            info.description shouldBe
                """Содержит коллекцию атрибутов узла. Коллекция атрибутов доступна только для узла Element.
Узел Атрибуты
* Attribute - `Неопределено`;
* CDATASection - `Неопределено`;
* Comment - `Неопределено`;
* Document - `Неопределено`;
* DocumentFragment - `Неопределено`;
* DocumentType - `Неопределено`;
* Element - `КоллекцияАтрибутовDOM`;
* Entity - `Неопределено`;
* EntityReference - `Неопределено`;
* Notation - `Неопределено`;
* ProcessingInstruction - `Неопределено`;
* Text - `Неопределено`."""
            Assertions.assertThat(info.relatedObjects).isNullOrEmpty()
        }
    })
