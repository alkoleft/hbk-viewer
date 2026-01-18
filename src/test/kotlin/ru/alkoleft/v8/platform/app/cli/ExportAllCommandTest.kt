/*
 * Copyright (c) 2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

@file:OptIn(kotlinx.cli.ExperimentalCli::class)

package ru.alkoleft.v8.platform.app.cli

import kotlinx.cli.ArgParser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.createFile
import kotlin.io.path.isRegularFile
import kotlin.io.path.writeText

/**
 * Тесты для [ExportAllCommand].
 *
 * Тестирует функциональность экспорта всех HBK книг из указанной директории.
 */
class ExportAllCommandTest {
    @TempDir
    lateinit var tempDir: Path

    private lateinit var sourceDir: Path
    private lateinit var outputDir: Path

    @BeforeEach
    fun setUp() {
        sourceDir = tempDir.resolve("source")
        outputDir = tempDir.resolve("output")
        sourceDir.createDirectories()
        outputDir.createDirectories()
    }

    @Test
    fun `should find and export all HBK files from directory`() {
        val book1 = sourceDir.resolve("book1.hbk")
        val book2 = sourceDir.resolve("book2.hbk")
        val book3 = sourceDir.resolve("book3.HBK")
        book1.createFile()
        book2.createFile()
        book3.createFile()

        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        assertThat(outputDir).exists()
        assertThat(outputDir).isDirectory()
        val book1Output = outputDir.resolve("book1")
        val book2Output = outputDir.resolve("book2")
        val book3Output = outputDir.resolve("book3")
        assertThat(book1Output).exists()
        assertThat(book2Output).exists()
        assertThat(book3Output).exists()
    }

    @Test
    fun `should handle empty directory gracefully`() {
        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        assertThat(outputDir).exists()
        assertThat(outputDir).isDirectory()
        assertThat(Files.list(outputDir).use { it.toList() }).isEmpty()
    }

    @Test
    fun `should skip non-HBK files`() {
        val hbkFile = sourceDir.resolve("book.hbk")
        val txtFile = sourceDir.resolve("book.txt")
        val pdfFile = sourceDir.resolve("book.pdf")
        hbkFile.createFile()
        txtFile.writeText("test")
        pdfFile.writeText("test")

        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        val outputFiles = Files.list(outputDir).use { it.toList() }
        assertThat(outputFiles).hasSize(1)
        assertThat(outputFiles.first().fileName.toString()).isEqualTo("book")
    }

    @Test
    fun `should handle case-insensitive HBK file extension`() {
        val book1 = sourceDir.resolve("book1.hbk")
        val book2 = sourceDir.resolve("book2.HBK")
        val book3 = sourceDir.resolve("book3.Hbk")
        book1.createFile()
        book2.createFile()
        book3.createFile()

        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        val outputFiles = Files.list(outputDir).use { it.toList() }
        assertThat(outputFiles).hasSize(3)
    }

    @Test
    fun `should export with pages-only option`() {
        val book1 = sourceDir.resolve("book1.hbk")
        book1.createFile()

        val command = createCommand(
            sourceDir = sourceDir.toString(),
            outputDir = outputDir.toString(),
            pagesOnly = true,
        )
        command.execute()

        assertThat(outputDir).exists()
        val book1Output = outputDir.resolve("book1")
        assertThat(book1Output).exists()
    }

    @Test
    fun `should export with include-toc option`() {
        val book1 = sourceDir.resolve("book1.hbk")
        book1.createFile()

        val command = createCommand(
            sourceDir = sourceDir.toString(),
            outputDir = outputDir.toString(),
            includeToc = true,
        )
        command.execute()

        assertThat(outputDir).exists()
        val book1Output = outputDir.resolve("book1")
        assertThat(book1Output).exists()
    }

    @Test
    fun `should export with preserve-structure option`() {
        val book1 = sourceDir.resolve("book1.hbk")
        book1.createFile()

        val command = createCommand(
            sourceDir = sourceDir.toString(),
            outputDir = outputDir.toString(),
            pagesOnly = true,
            preserveStructure = true,
        )
        command.execute()

        assertThat(outputDir).exists()
        val book1Output = outputDir.resolve("book1")
        assertThat(book1Output).exists()
    }

    @Test
    fun `should handle non-existent source directory`() {
        val nonExistentDir = tempDir.resolve("non-existent")
        val command = createCommand(nonExistentDir.toString(), outputDir.toString())

        command.execute()

        assertThat(outputDir).exists()
        assertThat(Files.list(outputDir).use { it.toList() }).isEmpty()
    }

    @Test
    fun `should handle file instead of directory as source`() {
        val fileAsSource = sourceDir.resolve("not-a-dir")
        fileAsSource.writeText("test")

        val command = createCommand(fileAsSource.toString(), outputDir.toString())
        command.execute()

        assertThat(outputDir).exists()
        assertThat(Files.list(outputDir).use { it.toList() }).isEmpty()
    }

    @Test
    fun `should create output directory if it does not exist`() {
        val newOutputDir = tempDir.resolve("new-output")
        val book1 = sourceDir.resolve("book1.hbk")
        book1.createFile()

        val command = createCommand(sourceDir.toString(), newOutputDir.toString())
        command.execute()

        assertThat(newOutputDir).exists()
        assertThat(newOutputDir).isDirectory()
    }

    @Test
    fun `should handle export errors gracefully and continue with other books`() {
        val validBook = sourceDir.resolve("valid.hbk")
        val invalidBook = sourceDir.resolve("invalid.hbk")
        validBook.createFile()
        invalidBook.createFile()
        invalidBook.writeText("invalid hbk content")

        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        assertThat(outputDir).exists()
        val validOutput = outputDir.resolve("valid")
        assertThat(validOutput).exists()
    }

    @Test
    fun `should process files in subdirectories correctly`() {
        val subDir = sourceDir.resolve("subdir")
        subDir.createDirectories()
        val book1 = sourceDir.resolve("book1.hbk")
        val book2 = subDir.resolve("book2.hbk")
        book1.createFile()
        book2.createFile()

        val command = createCommand(sourceDir.toString(), outputDir.toString())
        command.execute()

        val outputFiles = Files.list(outputDir).use { it.toList() }
        assertThat(outputFiles).hasSize(1)
        assertThat(outputFiles.first().fileName.toString()).isEqualTo("book1")
    }

    @Test
    fun `should export all HBK files from real 1C platform directory`() {
        val realSourceDir = Path("/opt/1cv8/x86_64/8.3.21.1895")
        val testOutputDir = Path.of("/tmp", "export_all")

        assumeTrue(
            Files.exists(realSourceDir) && Files.isDirectory(realSourceDir),
            "Интеграционный тест: директория 1C платформы не найдена по пути $realSourceDir. " +
                "Тест будет пропущен, если директория не существует.",
        )

        val hbkFiles = Files.list(realSourceDir).use { stream ->
            stream
                .filter { Files.isRegularFile(it) }
                .filter { it.fileName.toString().endsWith(".hbk", ignoreCase = true) }
                .toList()
        }

        assumeTrue(
            hbkFiles.isNotEmpty(),
            "Интеграционный тест: HBK файлы не найдены в директории $realSourceDir. " +
                "Тест будет пропущен, если файлы не найдены.",
        )

        val command = createCommand(realSourceDir.toString(), testOutputDir.toString())
        command.execute()

        assertThat(testOutputDir).exists()
        assertThat(testOutputDir).isDirectory()

        val exportedDirs = Files.list(testOutputDir).use { it.toList() }
        assertThat(exportedDirs).isNotEmpty()

        exportedDirs.forEach { exportedDir ->
            assertThat(exportedDir).exists()
            assertThat(exportedDir).isDirectory()

            val files = Files.walk(exportedDir)
                .filter { it.isRegularFile() }
                .toList()

            assertThat(files).isNotEmpty()
        }
    }

    /**
     * Создает команду ExportAllCommand с указанными параметрами.
     *
     * @param sourceDir Путь к исходной директории
     * @param outputDir Путь к выходной директории
     * @param pagesOnly Экспортировать только страницы
     * @param includeToc Включить оглавление
     * @param preserveStructure Сохранить структуру каталогов
     * @return Настроенная команда
     */
    private fun createCommand(
        sourceDir: String,
        outputDir: String,
        pagesOnly: Boolean = false,
        includeToc: Boolean = true,
        preserveStructure: Boolean = true,
    ): ExportAllCommand {
        val command = ExportAllCommand()
        val parser = ArgParser("test", strictSubcommandOptionsOrder = false)
        parser.subcommands(command)
        val args = mutableListOf("all", "--source", sourceDir, "--output", outputDir)
        if (pagesOnly) {
            args.add("--pages-only")
        }
        if (!includeToc) {
            args.add("--include-toc=false")
        }
        if (!preserveStructure) {
            args.add("--preserve-structure=false")
        }
        parser.parse(args.toTypedArray())
        return command
    }
}
