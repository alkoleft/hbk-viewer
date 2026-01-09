/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.bsl.platform.hbk.HbkPageReaderService
import ru.alkoleft.bsl.platform.hbk.dto.BookInfo
import ru.alkoleft.bsl.platform.hbk.dto.FileContent
import ru.alkoleft.bsl.platform.hbk.dto.FileStructure
import ru.alkoleft.bsl.platform.hbk.dto.PageDto
import ru.alkoleft.bsl.platform.hbk.exceptions.PlatformContextLoadException
import ru.alkoleft.bsl.platform.hbk.service.HbkFileScannerService

private val logger = KotlinLogging.logger { }

/**
 * REST контроллер для доступа к содержимому HBK файлов (книг).
 *
 * Предоставляет эндпоинты для:
 * - Получения списка доступных HBK книг
 * - Получения содержимого страниц из HBK книг
 * - Получения структуры (оглавления) HBK книг
 */
@RestController
@RequestMapping("/api/hbk")
class HbkRestController(
    private val fileScannerService: HbkFileScannerService,
    private val pageReaderService: HbkPageReaderService,
) {
    /**
     * Получает список всех доступных HBK книг.
     *
     * @return Список информации о книгах (с метаданными и локалью)
     */
    @GetMapping("/files")
    fun getFiles(): ResponseEntity<List<BookInfo>> {
        logger.debug { "Запрос списка HBK книг" }
        val books = fileScannerService.getAllFiles()
        return ResponseEntity.ok(books)
    }

    /**
     * Получает содержимое страницы из HBK файла.
     *
     * @param filename Имя HBK файла
     * @param htmlPath Путь к HTML странице (опционально, если не указано, возвращается первая страница)
     * @return Содержимое страницы
     */
    @GetMapping("/files/{filename}/content")
    fun getFileContent(
        @PathVariable filename: String,
        @RequestParam(required = false) htmlPath: String?,
    ): ResponseEntity<FileContent> {
        logger.debug { "Запрос содержимого файла: $filename, htmlPath: $htmlPath" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        return try {
            val actualHtmlPath = htmlPath ?: getFirstPageHtmlPath(filePath)
            val content = pageReaderService.readPageByName(filePath, actualHtmlPath)
            val toc = pageReaderService.readToc(filePath)
            val page = findPageByHtmlPath(toc, actualHtmlPath)
            val pageName = page?.title?.ru?.ifEmpty { page.title.en } ?: actualHtmlPath
            val fileContent =
                FileContent(
                    filename = filename,
                    pageName = pageName,
                    content = content,
                )
            ResponseEntity.ok(fileContent)
        } catch (e: PlatformContextLoadException) {
            logger.warn(e) { "Страница не найдена в файле $filename: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        } catch (e: Exception) {
            logger.error(e) { "Ошибка при чтении содержимого файла $filename" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Получает структуру (оглавление) HBK файла.
     * По умолчанию возвращает только корневые элементы без дочерних для оптимизации.
     *
     * @param filename Имя HBK файла
     * @param includeChildren Если true, возвращает полную иерархию (для обратной совместимости)
     * @return Структура файла с иерархией страниц
     */
    @GetMapping("/files/{filename}/structure")
    fun getFileStructure(
        @PathVariable filename: String,
        @RequestParam(required = false, defaultValue = "false") includeChildren: Boolean,
    ): ResponseEntity<FileStructure> {
        logger.debug { "Запрос структуры файла: $filename, includeChildren: $includeChildren" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        return try {
            val toc = pageReaderService.readToc(filePath)
            val pages =
                if (includeChildren) {
                    toc.pages.map { PageDto.from(it) }
                } else {
                    toc.pages.map { PageDto.fromLite(it) }
                }
            val structure =
                FileStructure(
                    filename = filename,
                    pages = pages,
                )
            ResponseEntity.ok(structure)
        } catch (e: PlatformContextLoadException) {
            logger.warn(e) { "Ошибка при чтении структуры файла $filename: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        } catch (e: Exception) {
            logger.error(e) { "Ошибка при чтении структуры файла $filename" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Получает дочерние элементы страницы по htmlPath.
     *
     * @param filename Имя HBK файла
     * @param htmlPath Путь к HTML файлу родительской страницы
     * @return Список дочерних страниц
     */
    @GetMapping("/files/{filename}/structure/children")
    fun getFileStructureChildren(
        @PathVariable filename: String,
        @RequestParam htmlPath: String,
    ): ResponseEntity<List<PageDto>> {
        logger.debug { "Запрос дочерних элементов файла: $filename, htmlPath: $htmlPath" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        return try {
            val toc = pageReaderService.readToc(filePath)
            val children = toc.getChildrenByHtmlPath(htmlPath)
            val childrenDto = children.map { PageDto.fromLite(it) }
            ResponseEntity.ok(childrenDto)
        } catch (e: PlatformContextLoadException) {
            logger.warn(e) { "Ошибка при чтении дочерних элементов файла $filename: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        } catch (e: Exception) {
            logger.error(e) { "Ошибка при чтении дочерних элементов файла $filename" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Выполняет поиск страниц в оглавлении файла.
     *
     * @param filename Имя HBK файла
     * @param query Поисковый запрос
     * @return Список найденных страниц
     */
    @GetMapping("/files/{filename}/structure/search")
    fun searchFileStructure(
        @PathVariable filename: String,
        @RequestParam query: String,
    ): ResponseEntity<List<PageDto>> {
        logger.debug { "Поиск в структуре файла: $filename, query: $query" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        if (query.isBlank()) {
            return ResponseEntity.badRequest().build()
        }

        return try {
            val toc = pageReaderService.readToc(filePath)
            val foundPages = toc.searchPages(query)
            val pagesDto = foundPages.map { PageDto.fromLite(it) }
            ResponseEntity.ok(pagesDto)
        } catch (e: PlatformContextLoadException) {
            logger.warn(e) { "Ошибка при поиске в структуре файла $filename: ${e.message}" }
            ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        } catch (e: Exception) {
            logger.error(e) { "Ошибка при поиске в структуре файла $filename" }
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    /**
     * Получает htmlPath первой страницы из оглавления файла.
     */
    private fun getFirstPageHtmlPath(filePath: java.nio.file.Path): String {
        val toc = pageReaderService.readToc(filePath)
        return if (toc.pages.isNotEmpty()) {
            toc.pages.first().htmlPath
        } else {
            throw PlatformContextLoadException("Оглавление файла пусто")
        }
    }

    /**
     * Ищет страницу по htmlPath в иерархии оглавления.
     */
    private fun findPageByHtmlPath(
        toc: ru.alkoleft.bsl.platform.hbk.reader.toc.Toc,
        htmlPath: String,
    ): ru.alkoleft.bsl.platform.hbk.models.Page? = toc.findPageByHtmlPath(htmlPath)
}
