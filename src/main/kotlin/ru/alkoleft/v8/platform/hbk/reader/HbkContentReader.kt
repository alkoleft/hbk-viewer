/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.reader

import io.github.oshai.kotlinlogging.KotlinLogging
import org.apache.commons.compress.archivers.zip.ZipFile
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel
import ru.alkoleft.v8.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.v8.platform.hbk.exceptions.TocParsingException
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.model.TocRecord
import ru.alkoleft.v8.platform.hbk.reader.meta.BookMeta
import ru.alkoleft.v8.platform.hbk.reader.meta.BookMetaParser
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.io.ByteArrayInputStream
import java.io.IOException
import java.io.InputStream
import java.nio.file.Path
import java.util.zip.ZipInputStream

private const val PACK_BLOCK_NAME = "PackBlock"
private const val FILE_STORAGE_NAME = "FileStorage"
private const val BOOK_NAME = "Book"

private val log = KotlinLogging.logger { }

/**
 * Читает содержимое HBK файлов и предоставляет доступ к их структуре.
 *
 * Этот класс является основным интерфейсом для работы с содержимым HBK файлов.
 * Он извлекает оглавление (Table of Contents) и файловое хранилище из HBK контейнера,
 * предоставляя доступ к HTML страницам документации через ZIP-архив.
 *
 * Основные возможности:
 * - Извлечение оглавления (TOC) из сжатого блока PackBlock
 * - Доступ к HTML файлам документации через ZIP-архив
 * - Предоставление контекста для парсинга страниц
 *
 * @see ContainerReader для извлечения данных из HBK контейнера
 * @see Toc для работы с оглавлением
 * @see ru.alkoleft.v8.platform.shctx.PlatformContextReader для полного процесса чтения контекста
 */
class HbkContentReader {
    /**
     * Читает HBK файл и выполняет блок кода с контекстом.
     *
     * @param path Путь к HBK файлу
     * @param block Блок кода, выполняемый с контекстом доступа к содержимому
     */
    fun read(
        path: Path,
        block: Context.() -> Unit,
    ) {
        ContainerReader.readContainer(path) {
            val toc = toc() ?: throw TocParsingException("Нет данных оглавления")
            zipContent {
                val context = Context(toc, it)
                context.apply(block)
            }
        }
    }

    fun readToc(path: Path): Toc? =
        ContainerReader.readContainer(path) {
            toc()
        }

    fun getPage(
        path: Path,
        pagePath: String,
    ): ByteArray =
        ContainerReader.readContainer(path) {
            zipContent {
                getEntryStream(it, pagePath).readAllBytes()
            }
        }

    fun getPageText(
        path: Path,
        pagePath: String,
    ) = getPage(path, pagePath).decodeToString()

    fun getMeta(path: Path): BookMeta =
        ContainerReader.readContainer(path) {
            log.debug { "Reading BOOK info: $path" }
            val parser = BookMetaParser()
            parser
                .parseContent(getEntity(BOOK_NAME)!!)
                .also { log.debug { it } }
        }

    private fun ContainerReader.EntitiesScope.toc() = getEntity(PACK_BLOCK_NAME)?.let { Toc.parse(getInflatePackBlock(it)) }

    private fun <R> ContainerReader.EntitiesScope.zipContent(block: (ZipFile) -> R): R {
        val fileStorage = getEntity(FILE_STORAGE_NAME)
        return SeekableInMemoryByteChannel(fileStorage).use {
            ZipFile
                .builder()
                .setSeekableByteChannel(it)
                .get()
                .use(block)
        }
    }

    /**
     * Контекст для работы с содержимым HBK файла.
     *
     * Предоставляет доступ к оглавлению и ZIP-архиву с HTML файлами документации.
     *
     * @property toc Оглавление HBK файла
     * @property zipFile ZIP-архив с HTML файлами документации
     */
    class Context(
        val toc: Toc,
        private val zipFile: ZipFile,
    ) {
        /**
         * Получает поток для чтения HTML файла страницы.
         *
         * @param page Страница документации
         * @return Поток для чтения HTML содержимого
         * @throws PlatformContextLoadException если файл не найден или имя не указано
         */
        fun getEntryStream(page: Page) = getEntryStream(page.location)

        /**
         * Получает поток для чтения HTML файла по имени.
         *
         * @param name Имя HTML файла в архиве
         * @return Поток для чтения HTML содержимого
         * @throws PlatformContextLoadException если файл не найден или имя не указано
         */
        fun getEntryStream(name: String) = getEntryStream(zipFile, name)
    }
}

private fun getInflatePackBlock(data: ByteArray): ByteArray {
    val inflateData: ByteArray

    try {
        ZipInputStream(ByteArrayInputStream(data)).use { stream ->
            stream.getNextEntry()
            inflateData = stream.readAllBytes()
        }
    } catch (ex: IOException) {
        throw RuntimeException(ex)
    }

    return inflateData
}

fun getEntryStream(
    zipFile: ZipFile,
    name: String,
): InputStream {
    if (name.isEmpty()) {
        throw PlatformContextLoadException("Не указано имя файла для поиска в архиве")
    }
    val validName =
        if (name.startsWith("/")) {
            name.substring(1)
        } else {
            name
        }
    val entry = zipFile.getEntry(validName)
    return if (entry != null) {
        zipFile.getInputStream(entry)
    } else {
        throw PlatformContextLoadException("Не найден файл в архиве $name")
    }
}
