/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the mcp-bsl-context project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Assumptions.assumeTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import ru.alkoleft.bsl.platform.hbk.exceptions.PlatformContextLoadException
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.Path

/**
 * Интеграционные тесты для [HbkPageReaderService].
 *
 * Требует наличия реального HBK файла для выполнения.
 * Путь к файлу можно задать через:
 * - Переменную окружения: `HBK_FILE_PATH`
 * - Системное свойство: `hbk.file.path`
 * - По умолчанию: `/opt/1cv8/x86_64/8.3.27.1326/shcntx_ru.hbk`
 *
 * Тесты будут пропущены, если файл не найден.
 */
class HbkPageReaderServiceTest {
    private lateinit var service: HbkPageReaderService
    private lateinit var hbkPath: Path

    @BeforeEach
    fun setUp() {
        service = HbkPageReaderService()
        hbkPath = getHbkFilePath()
        assumeTrue(
            Files.exists(hbkPath),
            "Интеграционный тест: HBK файл не найден по пути $hbkPath. " +
                "Установите переменную окружения HBK_FILE_PATH или системное свойство hbk.file.path",
        )
    }

    @Test
    fun `should read TOC from HBK file`() {
        val actualToc = service.readToc(hbkPath)

        assertThat(actualToc).isNotNull
        assertThat(actualToc.pages).isNotEmpty
    }

    @Test
    fun `should throw exception when page not found`() {
        val nonExistentPageName = "NonExistentPage12345"

        assertThatThrownBy {
            service.readPageByName(hbkPath, nonExistentPageName)
        }.isInstanceOf(PlatformContextLoadException::class.java)
            .hasMessageContaining("не найдена")
            .hasMessageContaining(nonExistentPageName)
    }

    @Test
    fun `should handle empty page name`() {
        assertThatThrownBy {
            service.readPageByName(hbkPath, "")
        }.isInstanceOf(PlatformContextLoadException::class.java)
            .hasMessageContaining("не найдена")
    }

    @Test
    fun `should read TOC and verify structure`() {
        val actualToc = service.readToc(hbkPath)

        assertThat(actualToc).isNotNull
        assertThat(actualToc.pages).isNotEmpty

        actualToc.pages.forEach { page ->
            assertThat(page.title.ru).isNotEmpty
            assertThat(page.htmlPath).isNotEmpty
        }
    }

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

        return Path("/opt/1cv8/x86_64/8.3.27.1326/shcntx_ru.hbk")
    }
}
