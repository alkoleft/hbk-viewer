/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.alkoleft.v8.platform.app.service.BooksService
import ru.alkoleft.v8.platform.app.service.HbkPathService
import ru.alkoleft.v8.platform.app.service.VersionService
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.app.web.controller.dto.FileContent
import ru.alkoleft.v8.platform.app.web.controller.dto.FileStructure
import ru.alkoleft.v8.platform.app.web.controller.dto.PageDto
import ru.alkoleft.v8.platform.app.web.controller.dto.VersionInfo
import ru.alkoleft.v8.platform.hbk.model.Page

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
    private val booksService: BooksService,
    private val pathService: HbkPathService,
    private val versionService: VersionService,
) {
    /**
     * Получает список всех доступных HBK книг.
     *
     * @return Список информации о книгах (с метаданными и локалью)
     */
    @GetMapping("/files")
    fun getBooks(): ResponseEntity<List<BookInfo>> {
        logger.debug { "Запрос списка HBK книг" }
        return ResponseEntity.ok(booksService.books)
    }

    /**
     * Получает список всех доступных локалей.
     *
     * @return Список доступных локалей
     */
    @GetMapping("/locales")
    fun getAvailableLocales(): ResponseEntity<List<String>> {
        logger.debug { "Запрос списка доступных локалей" }
        return ResponseEntity.ok(booksService.getAvailableLocales())
    }

    /**
     * Получает глобальное оглавление для указанной локали.
     *
     * @param locale Локаль (ru, en, root и т.д.)
     * @return Глобальное оглавление для локали
     */
    @GetMapping("/global-toc/{locale}")
    fun getGlobalToc(
        @PathVariable locale: String,
    ): ResponseEntity<FileStructure> {
        logger.debug { "Запрос глобального оглавления для локали: $locale" }

        val availableLocales = booksService.getAvailableLocales()
        if (locale !in availableLocales) {
            return ResponseEntity.notFound().build()
        }

        val globalToc = booksService.getGlobalTocByLocale(locale)
        val pages =
            globalToc.pages.map { page ->
                PageDto.fromLite(page)
            }

        val structure =
            FileStructure(
                filename = "global-$locale",
                pages = pages,
            )
        return ResponseEntity.ok(structure)
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
        @RequestParam(required = true) htmlPath: String,
    ): ResponseEntity<FileContent> {
        logger.debug { "Запрос содержимого файла: $filename, htmlPath: $htmlPath" }

        val page = booksService.getBookPageInfo(filename, htmlPath)
        val content = booksService.getBookPageContent(filename, htmlPath)
        logger.debug { "Загружено содержимое страницы '$htmlPath', размер: ${content.length} символов" }

        return ResponseEntity.ok(
            FileContent(
                filename = filename,
                pageName = page.title.ru.ifEmpty { page.title.en },
                content = content,
            ),
        )
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
        checkDepthParameter(depth)

        val toc = booksService.bookToc(filename)
        val pages =
            if (depth != null) {
                toc.pages.map { page -> PageDto.fromWithDepth(page, depth, listOf(page.location)) }
            } else {
                toc.pages.map { page -> PageDto.fromLite(page, listOf(page.location)) }
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

        val toc = booksService.bookToc(filename)
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
            children = toc.getChildrenByContentPath(normalizedHtmlPath)

            // Находим путь к родителю
            val parentPage =
                pathService.findPageByHtmlPath(toc, normalizedHtmlPath)
                    ?: return ResponseEntity.notFound().build()

//            parentPath = pathService.findPathToPage(toc, parentPage) ?: emptyList()
        } else {
            return ResponseEntity.badRequest().build()
        }

        val childrenDto =
            children.mapIndexed { index, child ->
                PageDto.fromLite(child, emptyList())
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

        if (query.isBlank() || query.length > 500) {
            return ResponseEntity.badRequest().build()
        }

        val toc = booksService.bookToc(filename)
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
