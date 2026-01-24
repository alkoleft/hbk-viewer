/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.storage

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component
import ru.alkoleft.v8.platform.app.config.ApplicationProperties
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import ru.alkoleft.v8.platform.hbk.util.LocaleExtractor
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.Path
import kotlin.streams.asSequence
import kotlin.time.measureTimedValue

private val logger = KotlinLogging.logger { }

/**
 * Сервис для сканирования каталога с HBK файлами (книгами).
 *
 * При старте приложения сканирует указанный каталог и формирует
 * перечень доступных HBK книг с их метаданными.
 */
@Component
class BookRegistry(
    applicationProperties: ApplicationProperties,
) {
    private val hbkContentReader = HbkContentReader()
    private val hbkDirectory = applicationProperties.hbkFilesDirectory
    val books: List<BookInfo> by lazy(::loadBooksWithMeasure)
    private val booksByFile: Map<String, BookInfo> by lazy {
        books.associateBy { it.filename }
    }

    /**
     * Получает список всех найденных HBK книг.
     *
     * @return Список информации о книгах
     */
    fun getAllFiles(): List<BookInfo> = books

    /**
     * Получает полную информацию о книге по имени.
     *
     * @param filename Имя файла
     * @return Информация о книге или null, если книга не найдена
     */
    fun getBookInfo(filename: String): BookInfo? = booksByFile[filename]

    /**
     * Получает путь к HBK файлу по имени.
     *
     * @param filename Имя файла
     * @return Путь к файлу или null, если файл не найден
     */
    fun getFilePath(filename: String): Path? = booksByFile[filename]?.let { Paths.get(it.path) }

    @Cacheable(value = ["tocCache"], key = "#book.path")
    fun getBookToc(book: BookInfo): Toc? {
        logger.debug { "Чтение оглавления из файла ${book.path}" }
        return hbkContentReader.readToc(Path(book.path))
    }

    private fun loadBooksWithMeasure() =
        measureTimedValue {
            loadBooks()
        }.also {
            logger.info { "Loading time: ${it.duration}, books count: ${it.value.size}" }
        }.value

    private fun loadBooks(): List<BookInfo> {
        if (hbkDirectory.isBlank()) {
            logger.warn { "Каталог с HBK файлами не указан. Используйте параметр 'application.hbk-files-directory'" }
            return emptyList()
        }

        val directoryPath = Paths.get(hbkDirectory)
        if (!Files.exists(directoryPath) || !Files.isDirectory(directoryPath)) {
            logger.error { "Каталог не существует или не является директорией: $hbkDirectory" }
            return emptyList()
        }

        logger.info { "Сканирование каталога с HBK книгами: $hbkDirectory" }

        return Files.list(directoryPath).use { stream ->
            stream
                .asSequence()
                .filter { Files.isRegularFile(it) }
                .filter { it.fileName.toString().endsWith(".hbk", ignoreCase = true) }
                .map(::loadBookInfo)
                .onEach { logger.debug { "Найдена HBK книга: ${it.filename} (локаль: ${it.locale})" } }
                .toList()
        }
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
}
