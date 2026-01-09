/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.service

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import ru.alkoleft.bsl.platform.hbk.dto.BookInfo
import ru.alkoleft.bsl.platform.hbk.reader.HbkContentReader
import ru.alkoleft.bsl.platform.hbk.util.LocaleExtractor
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

private val logger = KotlinLogging.logger { }

/**
 * Сервис для сканирования каталога с HBK файлами (книгами).
 *
 * При старте приложения сканирует указанный каталог и формирует
 * перечень доступных HBK книг с их метаданными.
 */
@Service
class HbkFileScannerService(
    @Value("\${hbk.files.directory:}")
    private val hbkDirectory: String,
    private val hbkContentReader: HbkContentReader,
) {
    private val books: MutableMap<String, BookInfo> = mutableMapOf()

    /**
     * Инициализация при старте приложения.
     * Сканирует каталог и загружает список HBK книг с метаданными.
     */
    @PostConstruct
    fun scanDirectory() {
        if (hbkDirectory.isBlank()) {
            logger.warn { "Каталог с HBK файлами не указан. Используйте параметр hbk.files.directory" }
            return
        }

        val directoryPath = Paths.get(hbkDirectory)
        if (!Files.exists(directoryPath) || !Files.isDirectory(directoryPath)) {
            logger.error { "Каталог не существует или не является директорией: $hbkDirectory" }
            return
        }

        logger.info { "Сканирование каталога с HBK книгами: $hbkDirectory" }

        Files.list(directoryPath).use { stream ->
            stream
                .filter { Files.isRegularFile(it) }
                .filter { it.fileName.toString().endsWith(".hbk", ignoreCase = true) }
                .forEach { path ->
                    val bookInfo = loadBookInfo(path)
                    books[bookInfo.filename] = bookInfo
                    logger.debug { "Найдена HBK книга: ${bookInfo.filename} (локаль: ${bookInfo.locale})" }
                }
        }

        logger.info { "Найдено HBK книг: ${books.size}" }
    }

    /**
     * Загружает информацию о книге из файла.
     *
     * @param path Путь к HBK файлу
     * @return Информация о книге
     */
    private fun loadBookInfo(path: Path): BookInfo {
        val filename = path.fileName.toString()
        val size =
            try {
                Files.size(path)
            } catch (e: Exception) {
                logger.warn(e) { "Не удалось получить размер файла: $filename" }
                0L
            }
        val locale = LocaleExtractor.extractLocale(filename)
        val meta =
            try {
                hbkContentReader.getMeta(path)
            } catch (e: Exception) {
                logger.warn(e) { "Не удалось загрузить метаданные для книги: $filename" }
                null
            }
        return BookInfo(
            filename = filename,
            path = path.toString(),
            size = size,
            meta = meta,
            locale = locale,
        )
    }

    /**
     * Получает список всех найденных HBK книг.
     *
     * @return Список информации о книгах
     */
    fun getAllFiles(): List<BookInfo> = books.values.toList()

    /**
     * Получает полную информацию о книге по имени.
     *
     * @param filename Имя файла
     * @return Информация о книге или null, если книга не найдена
     */
    fun getBookInfo(filename: String): BookInfo? = books[filename]

    /**
     * Получает путь к HBK файлу по имени.
     *
     * @param filename Имя файла
     * @return Путь к файлу или null, если файл не найден
     */
    fun getFilePath(filename: String): Path? = books[filename]?.let { Paths.get(it.path) }

    /**
     * Проверяет, существует ли книга с указанным именем.
     *
     * @param filename Имя файла
     * @return true, если книга найдена
     */
    fun fileExists(filename: String): Boolean = books.containsKey(filename)
}
