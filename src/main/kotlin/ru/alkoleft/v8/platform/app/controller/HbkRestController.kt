/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.controller.dto.BookInfo
import ru.alkoleft.v8.platform.app.controller.dto.FileContent
import ru.alkoleft.v8.platform.app.controller.dto.FileStructure
import ru.alkoleft.v8.platform.app.controller.dto.PageDto
import ru.alkoleft.v8.platform.app.controller.dto.VersionInfo
import ru.alkoleft.v8.platform.app.service.HbkFileScannerService
import ru.alkoleft.v8.platform.app.service.HbkPathService
import ru.alkoleft.v8.platform.app.service.VersionService
import ru.alkoleft.v8.platform.hbk.HbkPageReaderService
import ru.alkoleft.v8.platform.hbk.models.Page

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
    private val pathService: HbkPathService,
    private val versionService: VersionService,
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

        val toc = pageReaderService.readToc(filePath)
        val actualHtmlPath =
            if (htmlPath != null) {
                pathService.validateAndNormalizeHtmlPath(htmlPath)
            } else {
                pathService.getFirstPageHtmlPath(toc)
            }

        logger.debug { "Нормализация htmlPath: '$htmlPath' -> '$actualHtmlPath'" }

        val content = pageReaderService.readPageByName(filePath, actualHtmlPath)
        logger.debug { "Загружено содержимое страницы '$actualHtmlPath', размер: ${content.length} байт" }

        val page = pathService.findPageByHtmlPath(toc, actualHtmlPath)
        val pageName = page?.title?.ru?.ifEmpty { page?.title?.en } ?: actualHtmlPath

        val fileContent =
            FileContent(
                filename = filename,
                pageName = pageName,
                content = content,
            )
        return ResponseEntity.ok(fileContent)
    }

    /**
     * Получает структуру (оглавление) HBK файла.
     * По умолчанию возвращает только корневые элементы без дочерных для оптимизации.
     *
     * @param filename Имя HBK файла
     * @param depth Глубина загрузки подчиненных элементов (0 = только корневой уровень, 1 = корневой + первый уровень подчиненных, и т.д.)
     * @return Структура файла с иерархией страниц
     */
    @GetMapping("/files/{filename}/structure")
    fun getFileStructure(
        @PathVariable filename: String,
        @RequestParam(required = false) depth: Int?,
    ): ResponseEntity<FileStructure> {
        logger.debug { "Запрос структуры файла: $filename, depth: $depth" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        val toc = pageReaderService.readToc(filePath)
        val pages =
            if (depth != null) {
                if (depth < 0) {
                    return ResponseEntity.badRequest().build()
                }
                toc.pages.mapIndexed { index, page -> PageDto.fromWithDepth(page, depth, listOf(index)) }
            } else {
                toc.pages.mapIndexed { index, page -> PageDto.fromLite(page, listOf(index)) }
            }

        val structure =
            FileStructure(
                filename = filename,
                pages = pages,
            )
        return ResponseEntity.ok(structure)
    }

    /**
     * Получает дочерние элементы страницы по htmlPath или по пути от корня (path).
     * Если указан path, используется он для уникальной идентификации элемента (даже если несколько элементов имеют одинаковый htmlPath).
     * Если path не указан, используется htmlPath (для обратной совместимости).
     *
     * @param filename Имя HBK файла
     * @param htmlPath Путь к HTML файлу родительской страницы (используется если path не указан)
     * @param path Путь от корня до родительской страницы (массив индексов, например "0,2,1")
     * @return Список дочерних страниц
     */
    @GetMapping("/files/{filename}/structure/children")
    fun getFileStructureChildren(
        @PathVariable filename: String,
        @RequestParam(required = false) htmlPath: String?,
        @RequestParam(required = false) path: String?,
    ): ResponseEntity<List<PageDto>> {
        logger.debug { "Запрос дочерных элементов файла: $filename, htmlPath: $htmlPath, path: $path" }

        val filePath =
            fileScannerService.getFilePath(filename)
                ?: return ResponseEntity.notFound().build()

        val toc = pageReaderService.readToc(filePath)
        val children: List<Page>
        val parentPath: List<Int>

        // Если указан path, используем его для уникальной идентификации
        if (path != null && path.isNotBlank()) {
            val pathList =
                try {
                    pathService.parsePathString(path)
                } catch (e: IllegalArgumentException) {
                    return ResponseEntity.badRequest().build()
                }

            val parentPage =
                toc.findPageByPath(pathList)
                    ?: return ResponseEntity.notFound().build()

            children = parentPage.children
            parentPath = pathList
        } else if (htmlPath != null && htmlPath.isNotBlank()) {
            // Для обратной совместимости используем htmlPath
            val normalizedHtmlPath = pathService.validateAndNormalizeHtmlPath(htmlPath)
            children = toc.getChildrenByHtmlPath(normalizedHtmlPath)

            // Находим путь к родителю
            val parentPage =
                pathService.findPageByHtmlPath(toc, normalizedHtmlPath)
                    ?: return ResponseEntity.notFound().build()

            parentPath = pathService.findPathToPage(toc, parentPage) ?: emptyList()
        } else {
            return ResponseEntity.badRequest().build()
        }

        val childrenDto =
            children.mapIndexed { index, child ->
                PageDto.fromLite(child, parentPath + index)
            }
        return ResponseEntity.ok(childrenDto)
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

        if (query.isBlank() || query.length > 500) {
            return ResponseEntity.badRequest().build()
        }

        val toc = pageReaderService.readToc(filePath)
        val foundPages = toc.searchPages(query)

        // Для найденных страниц строим path и возвращаем с полной иерархией для контекста
        val pagesDto =
            foundPages.mapNotNull { page ->
                val path = pathService.findPathToPage(toc, page)
                if (path != null) {
                    // Для результатов поиска возвращаем с полной иерархией для контекста
                    PageDto.from(page, path)
                } else {
                    null
                }
            }
        return ResponseEntity.ok(pagesDto)
    }

    /**
     * Получает информацию о версиях приложения и платформы 1С.
     *
     * @param platformPath Опциональный путь к директории установки платформы 1С (для определения версии 1С)
     * @return Информация о версиях
     */
    @GetMapping("/version")
    fun getVersion(
        @RequestParam(required = false) platformPath: String?,
    ): ResponseEntity<VersionInfo> {
        logger.debug { "Запрос информации о версиях, platformPath: $platformPath" }
        return ResponseEntity.ok(versionService.versionsInfo)
    }
}
