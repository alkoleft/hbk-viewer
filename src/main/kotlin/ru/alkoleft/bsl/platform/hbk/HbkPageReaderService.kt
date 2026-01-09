/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the mcp-bsl-context project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import ru.alkoleft.bsl.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.bsl.platform.hbk.reader.HbkContentReader
import ru.alkoleft.bsl.platform.hbk.reader.toc.Toc
import java.nio.file.Path

private val logger = KotlinLogging.logger { }

/**
 * Сервис для чтения страниц из HBK файлов по имени.
 *
 * Предоставляет функциональность для:
 * - Чтения конкретной страницы по имени из HBK файла
 * - Получения оглавления (TOC) из HBK файла
 * - Поиска страниц по имени в иерархии оглавления
 *
 * @see HbkContentReader для работы с содержимым HBK файла
 * @see Toc для работы с оглавлением
 */
@Service
class HbkPageReaderService {
    /**
     * Читает страницу по имени из HBK файла.
     *
     * @param hbkPath Путь к HBK файлу
     * @param htmlPath Адрес страницы
     * @return Поток для чтения HTML содержимого страницы
     * @throws PlatformContextLoadException если страница не найдена
     */
    fun readPageByName(
        hbkPath: Path,
        htmlPath: String,
    ): String {
        logger.debug { "Поиск страницы '$htmlPath' в файле $hbkPath" }

        val reader = HbkContentReader()
        val pageContent = reader.getPage(hbkPath, htmlPath)

        return pageContent.decodeToString()
    }

    /**
     * Читает оглавление (TOC) из HBK файла.
     * Результат кэшируется по пути к файлу для оптимизации повторных обращений.
     *
     * @param hbkPath Путь к HBK файлу
     * @return Оглавление с иерархией страниц
     */
    @Cacheable(value = ["tocCache"], key = "#hbkPath.toString()")
    fun readToc(hbkPath: Path): Toc {
        logger.debug { "Чтение оглавления из файла $hbkPath" }
        val reader = HbkContentReader()
        return reader.readToc(hbkPath)
    }
}
