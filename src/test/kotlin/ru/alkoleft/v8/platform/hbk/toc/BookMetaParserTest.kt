/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.toc

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import ru.alkoleft.v8.platform.hbk.exceptions.PageDescriptionParsingError
import ru.alkoleft.v8.platform.hbk.reader.meta.BookMetaParser

class BookMetaParserTest {
    @Test
    fun `parseContent should parse valid page description`() {
        val content = """{7,"SyntaxHelperCommonLanguage",
{1,1,
{"#","Shclang"}
},5,"CONFIG",
{1,0},"ENTERPRISE",
{1,0},"ENTERPRISE82",
{1,0},"MNG_ENTERPRISE",
{1,0},"WEB_ENTERPRISE",
{1,0},0}"""
        val parser = BookMetaParser()
        val result = parser.parseContent(content)
        assertThat(result.bookName).isEqualTo("SyntaxHelperCommonLanguage")
        assertThat(result.description).isEqualTo("Shclang")
        assertThat(result.tags).containsExactly(
            "CONFIG",
            "ENTERPRISE",
            "ENTERPRISE82",
            "MNG_ENTERPRISE",
            "WEB_ENTERPRISE",
        )
    }

    @Test
    fun `parseContent should parse page description with single tag`() {
        val content = """{7,"TestBook",
{1,1,
{"#","testfile"}
},1,"TAG1",
{1,0},0}"""
        val parser = BookMetaParser()
        val result = parser.parseContent(content)
        assertThat(result.bookName).isEqualTo("TestBook")
        assertThat(result.description).isEqualTo("testfile")
        assertThat(result.tags).containsExactly("TAG1")
    }

    @Test
    fun `parseContent should parse page description without tags`() {
        val content = """{7,"TestBook",
{1,1,
{"#","testfile"}
},0,0}"""
        val parser = BookMetaParser()
        val result = parser.parseContent(content)
        assertThat(result.bookName).isEqualTo("TestBook")
        assertThat(result.description).isEqualTo("testfile")
        assertThat(result.tags).isEmpty()
    }

    @Test
    fun `parseContent should throw exception for invalid structure`() {
        val content = """{7,"TestBook",
{1,1,
{"#","testfile"}
},1,"TAG1",
{1,0},1}"""
        val parser = BookMetaParser()
        assertThrows<PageDescriptionParsingError> {
            parser.parseContent(content)
        }
    }

    @Test
    fun `parseContent should throw exception for missing closing brace`() {
        val content = """{7,"TestBook",
{1,1,
{"#","testfile"}
},0,
{1,0},0"""
        val parser = BookMetaParser()
        assertThrows<PageDescriptionParsingError> {
            parser.parseContent(content)
        }
    }

    @Test
    fun `parseContent should parse from bytes`() {
        val content = """{7,"SyntaxHelperCommonLanguage",
{1,1,
{"#","Shclang"}
},5,"CONFIG",
{1,0},"ENTERPRISE",
{1,0},"ENTERPRISE82",
{1,0},"MNG_ENTERPRISE",
{1,0},"WEB_ENTERPRISE",
{1,0},0}"""
        val bytes = content.toByteArray(Charsets.UTF_8)
        val parser = BookMetaParser()
        val result = parser.parseContent(bytes)
        assertThat(result.bookName).isEqualTo("SyntaxHelperCommonLanguage")
        assertThat(result.description).isEqualTo("Shclang")
        assertThat(result.tags).hasSize(5)
    }
}
