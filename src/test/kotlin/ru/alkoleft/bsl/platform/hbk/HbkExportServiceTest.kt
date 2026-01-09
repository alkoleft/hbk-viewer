/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the mcp-bsl-context project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.Path
import kotlin.io.path.isRegularFile

/**
 * Интеграционные тесты для [HbkExportService].
 *
 * Требует наличия реального HBK файла для выполнения.
 * Путь к файлу можно задать через:
 * - Переменную окружения: `HBK_FILE_PATH`
 * - Системное свойство: `hbk.file.path`
 * - По умолчанию: `/opt/1cv8/x86_64/8.3.27.1326/shcntx_ru.hbk`
 *
 * Тесты будут пропущены, если файл не найден.
 */
class HbkExportServiceTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var service: HbkExportService
    private lateinit var hbkPath: Path

    @BeforeEach
    fun setUp() {
        service = HbkExportService()
        hbkPath = getHbkFilePath()
        assumeTrue(
            Files.exists(hbkPath),
            "Интеграционный тест: HBK файл не найден по пути $hbkPath. " +
                "Установите переменную окружения HBK_FILE_PATH или системное свойство hbk.file.path",
        )
    }

    @Test
    fun `should export all files from HBK archive`() {
        val outputDir = Path.of("", "tmp", "export_all")

        service.export(Path("/opt/1cv8/x86_64/8.3.21.1895/1cv8_ru.hbk"), outputDir, includeToc = false)

        assertThat(outputDir).exists()
        assertThat(outputDir).isDirectory()

        val files =
            Files
                .walk(outputDir)
                .filter { it.isRegularFile() }
                .toList()

        assertThat(files).isNotEmpty
    }

    @Test
    fun `should export all files from HBK archive bad`() {
        val outputDir = Path.of("", "tmp", "export_all")

        service.export(Path("/opt/1cv8/x86_64/8.3.21.1895/1cv8_root.hbk"), outputDir, includeToc = true)

        assertThat(outputDir).exists()
        assertThat(outputDir).isDirectory()

        val files =
            Files
                .walk(outputDir)
                .filter { it.isRegularFile() }
                .toList()

        assertThat(files).isNotEmpty
    }
//
//    @Test
//    fun `should export files with directory structure preserved`() {
//        val outputDir = tempDir.resolve("export_structure")
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        val files = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(files).isNotEmpty
//
//        files.forEach { file ->
//            val relativePath = outputDir.relativize(file)
//            assertThat(relativePath.parent).isNotNull
//        }
//    }
//
//    @Test
//    fun `should export TOC file when includeToc is true`() {
//        val outputDir = tempDir.resolve("export_with_toc")
//
//        service.export(hbkPath, outputDir, includeToc = true)
//
//        val tocFile = outputDir.resolve("toc.txt")
//        assertThat(tocFile).exists()
//        assertThat(tocFile).isRegularFile()
//
//        val tocContent = tocFile.readText(Charsets.UTF_8)
//        assertThat(tocContent).isNotEmpty
//        assertThat(tocContent).contains("-")
//    }
//
//    @Test
//    fun `should not export TOC file when includeToc is false`() {
//        val outputDir = tempDir.resolve("export_without_toc")
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        val tocFile = outputDir.resolve("toc.txt")
//        assertThat(tocFile).doesNotExist()
//    }
//
//    @Test
//    fun `should export TOC with correct structure`() {
//        val outputDir = tempDir.resolve("export_toc_structure")
//
//        service.export(hbkPath, outputDir, includeToc = true)
//
//        val tocFile = outputDir.resolve("toc.txt")
//        val tocContent = tocFile.readText(Charsets.UTF_8)
//
//        val lines = tocContent.lines().filter { it.isNotBlank() }
//        assertThat(lines).isNotEmpty
//
//        lines.forEach { line ->
//            assertThat(line).contains("-")
//        }
//    }
//
//    @Test
//    fun `should export pages only with structure preserved`() {
//        val outputDir = tempDir.resolve("export_pages_only")
//
//        service.exportPagesOnly(hbkPath, outputDir, preserveStructure = true)
//
//        assertThat(outputDir).exists()
//        assertThat(outputDir).isDirectory()
//
//        val files = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(files).isNotEmpty
//    }
//
//    @Test
//    fun `should export pages only without structure when preserveStructure is false`() {
//        val outputDir = tempDir.resolve("export_pages_flat")
//
//        service.exportPagesOnly(hbkPath, outputDir, preserveStructure = false)
//
//        assertThat(outputDir).exists()
//        assertThat(outputDir).isDirectory()
//
//        val files = Files.list(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(files).isNotEmpty
//
//        files.forEach { file ->
//            val fileName = file.fileName.toString()
//            assertThat(fileName).doesNotContain("/")
//            assertThat(fileName).doesNotContain("\\")
//        }
//    }
//
//    @Test
//    fun `should create output directory if it does not exist`() {
//        val outputDir = tempDir.resolve("new_directory").resolve("nested")
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        assertThat(outputDir).exists()
//        assertThat(outputDir).isDirectory()
//    }
//
//    @Test
//    fun `should throw exception when HBK file does not exist`() {
//        val nonExistentPath = tempDir.resolve("non_existent.hbk")
//        val outputDir = tempDir.resolve("output")
//
//        assertThatThrownBy {
//            service.export(nonExistentPath, outputDir)
//        }
//            .isInstanceOf(IllegalArgumentException::class.java)
//            .hasMessageContaining("не существует")
//    }
//
//    @Test
//    fun `should throw exception when output path is not a directory`() {
//        val outputFile = tempDir.resolve("output_file.txt")
//        Files.createFile(outputFile)
//
//        assertThatThrownBy {
//            service.export(hbkPath, outputFile)
//        }
//            .isInstanceOf(IllegalArgumentException::class.java)
//            .hasMessageContaining("не является директорией")
//    }
//
//    @Test
//    fun `should export HTML files with valid content`() {
//        val outputDir = tempDir.resolve("export_html_content")
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        val htmlFiles = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .filter { it.fileName.toString().endsWith(".html", ignoreCase = true) }
//            .limit(5)
//            .toList()
//
//        assumeTrue(htmlFiles.isNotEmpty(), "Должен быть хотя бы один HTML файл для проверки")
//
//        htmlFiles.forEach { htmlFile ->
//            val content = htmlFile.readText(Charsets.UTF_8)
//            assertThat(content).isNotEmpty
//            assertThat(content.length).isGreaterThan(10)
//        }
//    }
//
//    @Test
//    fun `should export all files from archive`() {
//        val outputDir = tempDir.resolve("export_all_files")
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        val allFiles = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(allFiles.size).isGreaterThan(0)
//
//        allFiles.forEach { file ->
//            assertThat(file).exists()
//            assertThat(file).isRegularFile()
//            assertThat(Files.size(file)).isGreaterThan(0)
//        }
//    }
//
//    @Test
//    fun `should handle export to existing directory`() {
//        val outputDir = tempDir.resolve("existing_dir")
//        Files.createDirectories(outputDir)
//
//        service.export(hbkPath, outputDir, includeToc = false)
//
//        assertThat(outputDir).exists()
//        val files = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//        assertThat(files).isNotEmpty
//    }
//
//    @Test
//    fun `should export pages only and verify they match TOC`() {
//        val outputDir = tempDir.resolve("export_pages_verify")
//
//        val reader = HbkPageReaderService()
//        val toc = reader.readToc(hbkPath)
//
//        service.exportPagesOnly(hbkPath, outputDir, preserveStructure = true)
//
//        val exportedFiles = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .map { outputDir.relativize(it).toString().replace("\\", "/") }
//            .toList()
//            .toSet()
//
//        val pagesWithPaths = mutableListOf<String>()
//        fun collectPagePaths(pages: List<ru.alkoleft.bsl.platform.hbk.models.Page>) {
//            pages.forEach { page ->
//                if (page.htmlPath.isNotEmpty()) {
//                    pagesWithPaths.add(page.htmlPath)
//                }
//                if (page.children.isNotEmpty()) {
//                    collectPagePaths(page.children)
//                }
//            }
//        }
//        collectPagePaths(toc.pages)
//
//        val pagesWithFiles = pagesWithPaths.filter { path ->
//            exportedFiles.contains(path)
//        }
//
//        assertThat(pagesWithFiles.size).isGreaterThan(0)
//    }
//
//    @Test
//    fun `should export multiple times to same directory`() {
//        val outputDir = tempDir.resolve("export_multiple")
//
//        service.export(hbkPath, outputDir, includeToc = true)
//        val firstExportFiles = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        service.export(hbkPath, outputDir, includeToc = true)
//        val secondExportFiles = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(firstExportFiles.size).isEqualTo(secondExportFiles.size)
//    }
//
//    @Test
//    fun `should export TOC with hierarchical structure`() {
//        val outputDir = tempDir.resolve("export_toc_hierarchy")
//
//        service.export(hbkPath, outputDir, includeToc = true)
//
//        val tocFile = outputDir.resolve("toc.txt")
//        val tocContent = tocFile.readText(Charsets.UTF_8)
//
//        val lines = tocContent.lines().filter { it.isNotBlank() }
//        assertThat(lines.size).isGreaterThan(1)
//
//        var previousIndent = -1
//        lines.forEach { line ->
//            val indent = line.takeWhile { it == ' ' }.length
//            if (previousIndent >= 0) {
//                assertThat(indent).isGreaterThanOrEqualTo(previousIndent - 2)
//            }
//            previousIndent = indent
//        }
//    }
//
//    @Test
//    fun `should export pages only handle missing pages gracefully`() {
//        val outputDir = tempDir.resolve("export_pages_graceful")
//
//        service.exportPagesOnly(hbkPath, outputDir, preserveStructure = true)
//
//        val files = Files.walk(outputDir)
//            .filter { it.isRegularFile() }
//            .toList()
//
//        assertThat(files).isNotEmpty
//    }

    /**
     * Получает путь к HBK файлу из переменной окружения или системного свойства.
     *
     * @return Путь к HBK файлу
     */
    private fun getHbkFilePath(): Path {
        val envPath = System.getenv("HBK_FILE_PATH")
        if (!envPath.isNullOrBlank()) {
            return Path(envPath)
        }

        val systemPropertyPath = System.getProperty("hbk.file.path")
        if (!systemPropertyPath.isNullOrBlank()) {
            return Path(systemPropertyPath)
        }

        return Path("/opt/1cv8/x86_64/8.3.21.1895/1cv8_root.hbk")
    }
}
