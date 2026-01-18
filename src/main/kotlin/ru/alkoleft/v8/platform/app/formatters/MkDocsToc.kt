/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.formatters

import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.io.BufferedWriter
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.Path
import kotlin.io.path.absolutePathString
import kotlin.io.path.exists
import kotlin.io.path.isDirectory
import kotlin.io.path.moveTo

class MkDocsToc : TocFormatter {
    override fun export(toc: Toc, output: Path) {
        val header = this.javaClass.classLoader.getResource("mkdocs.yml").readText()
        val filePath =
            if (output.isDirectory())
                output.resolve("mkdocs.yml")
            else output
        Files.newBufferedWriter(filePath).use { stream ->
            stream.appendLine(header)
            writeChildren(stream, toc.pages, 1)
        }
        renameFiles(toc, output)
    }

    private fun writeChildren(stream: BufferedWriter, pages: List<Page>, level: Int) {
        val indent = "  ".repeat(level)
        pages.forEach { page ->
            stream.write("$indent- ${title(page)}:")
            if (page.htmlPath.isNotBlank() && page.children.isEmpty()) {
                stream.write(" ${page.htmlPath.trimStart('/')}.md")
            }

            stream.newLine()
            writeChildren(stream, page.children, level + 1)
        }
    }

    private fun renameFiles(toc: Toc, output: Path) {
        val docsPath = output.resolve("docs")
        renameChildrenFiles(toc.pages, docsPath)

    }

    private fun renameChildrenFiles(pages: List<Page>, docsPath: Path) {
        pages.forEach { page ->
            if (page.htmlPath.isNotBlank() && page.children.isEmpty()) {
                val pagePath = docsPath.resolve(page.htmlPath.trimStart('/'))
                if (pagePath.exists() && !pagePath.isDirectory()) {
                    pagePath.moveTo(Path(pagePath.absolutePathString() + ".md"))
                }
            }
            renameChildrenFiles(page.children, docsPath)
        }
    }

    private fun title(page: Page): String {
        val title = page.title.ru.ifBlank { page.title.en }
        return when {
            title.isBlank() -> "<Blank title>"
            title.contains("@")
                || title.contains(":")
                || title.contains("[")
                || title.contains("]")
                || title.contains("?") -> "\"$title\""

            else -> title
        }
    }
}