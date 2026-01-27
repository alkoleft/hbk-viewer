/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.annotation.PreDestroy
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.yield
import org.apache.lucene.analysis.ru.RussianAnalyzer
import org.apache.lucene.document.Document
import org.apache.lucene.document.Field
import org.apache.lucene.document.StringField
import org.apache.lucene.document.TextField
import org.apache.lucene.index.DirectoryReader
import org.apache.lucene.index.IndexWriter
import org.apache.lucene.index.IndexWriterConfig
import org.apache.lucene.queryparser.classic.QueryParser
import org.apache.lucene.search.IndexSearcher
import org.apache.lucene.search.highlight.Highlighter
import org.apache.lucene.search.highlight.QueryScorer
import org.apache.lucene.search.highlight.SimpleHTMLFormatter
import org.apache.lucene.store.FSDirectory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import ru.alkoleft.v8.platform.app.web.controller.dto.BookInfo
import ru.alkoleft.v8.platform.app.web.controller.dto.IndexingState
import ru.alkoleft.v8.platform.app.web.controller.dto.IndexingStatus
import ru.alkoleft.v8.platform.app.web.controller.dto.LocaleIndexingStatus
import ru.alkoleft.v8.platform.app.web.controller.dto.SearchResponse
import ru.alkoleft.v8.platform.app.web.controller.dto.SearchResult
import ru.alkoleft.v8.platform.hbk.model.Page
import ru.alkoleft.v8.platform.hbk.reader.HbkContentReader
import ru.alkoleft.v8.platform.hbk.reader.toc.BookPage
import ru.alkoleft.v8.platform.hbk.reader.toc.Toc
import java.nio.file.Path
import java.nio.file.Paths
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap
import kotlin.system.measureTimeMillis

private val logger = KotlinLogging.logger { }

@Service
class LuceneSearchService(
    private val globalTocService: GlobalTocService,
    private val booksService: BooksService,
) {
    private val analyzer = RussianAnalyzer()
    private val indexBasePath = Paths.get("lucene-index")
    private val indexSearchers = mutableMapOf<String, IndexSearcher>()
    private val indexingStatuses = ConcurrentHashMap<String, LocaleIndexingStatus>()
    private val indexingScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    @EventListener(ApplicationReadyEvent::class)
    fun startAsyncIndexing() {
        logger.info { "Запуск асинхронной индексации..." }

        val locales = globalTocService.getAvailableLocales()
        locales.forEach { locale ->
            indexingStatuses[locale] = LocaleIndexingStatus(locale = locale, state = IndexingState.NOT_STARTED)
        }

        indexingScope.launch {
            locales.forEach { locale ->
                launch { buildIndexForLocaleAsync(locale) }
            }
        }
    }

    private suspend fun buildIndexForLocaleAsync(locale: String) {
        updateIndexingStatus(locale) { it.copy(state = IndexingState.IN_PROGRESS, startTime = LocalDateTime.now()) }

        try {
            val localeIndexPath = indexBasePath.resolve(locale)
            val books = booksService.findBooksByLocale(locale).toList()
            updateIndexingStatus(locale) { it.copy(totalDocuments = books.size) }

            FSDirectory.open(localeIndexPath).use { directory ->
                val config =
                    IndexWriterConfig(analyzer).apply {
                        setRAMBufferSizeMB(256.0)
                        setUseCompoundFile(false)
                    }

                IndexWriter(directory, config).use { writer ->
                    writer.deleteAll()
                    indexLocaleAsync(writer, locale, books)
                }

                val reader = DirectoryReader.open(directory)
                indexSearchers[locale] = IndexSearcher(reader)
            }

            updateIndexingStatus(locale) { it.copy(state = IndexingState.COMPLETED, endTime = LocalDateTime.now(), progress = 100) }
            logger.info { "Индекс для локали $locale готов. Документов: ${indexSearchers[locale]?.indexReader?.numDocs()}" }
        } catch (e: Exception) {
            logger.error(e) { "Ошибка индексации локали $locale" }
            updateIndexingStatus(locale) { it.copy(state = IndexingState.FAILED, endTime = LocalDateTime.now(), errorMessage = e.message) }
        }
    }

    private suspend fun indexLocaleAsync(
        writer: IndexWriter,
        locale: String,
        books: List<BookInfo>,
    ) {
        val globalToc = globalTocService.getGlobalTocByLocale(locale)
        val reader = HbkContentReader()
        var processedBooks = 0

        books.forEach { book ->
            reader.readWithoutExceptions(Path.of(book.path)) {
                if (toc != Toc.EMPTY) {
                    indexPages(globalToc.pages, book, writer)
                }
            }

            processedBooks++
            updateIndexingStatus(locale) { it.copy(indexedDocuments = processedBooks, progress = (processedBooks * 100) / books.size) }
            yield()
        }
    }

    private fun updateIndexingStatus(
        locale: String,
        update: (LocaleIndexingStatus) -> LocaleIndexingStatus,
    ) {
        indexingStatuses.compute(locale) { _, current ->
            update(current ?: LocaleIndexingStatus(locale, IndexingState.NOT_STARTED))
        }
    }

    fun getIndexingStatus(): IndexingStatus {
        val statuses = indexingStatuses.values.toList()
        val overallProgress = if (statuses.isNotEmpty()) statuses.sumOf { it.progress } / statuses.size else 0
        val isInProgress = statuses.any { it.state == IndexingState.IN_PROGRESS }

        return IndexingStatus(locales = statuses, overallProgress = overallProgress, isIndexingInProgress = isInProgress)
    }

    private fun HbkContentReader.Context.indexPages(
        pages: List<Page>,
        book: BookInfo,
        writer: IndexWriter,
        parentPath: List<String> = emptyList(),
    ) {
        pages.forEach { page ->
            if (page is BookPage && page.book == book && page.location.isNotEmpty()) {
                try {
                    val content = getEntryStream(page).readAllBytes().decodeToString()
                    val cleanContent = extractTextFromHtml(content)
                    val breadcrumbs = parentPath + page.getTitle()

                    val doc =
                        Document().apply {
                            add(StringField("location", page.location, Field.Store.YES))
                            add(StringField("bookName", page.book.meta?.bookName ?: "", Field.Store.YES))
                            add(TextField("title", page.getTitle(), Field.Store.YES))
                            add(TextField("content", cleanContent, Field.Store.YES))
                            add(TextField("breadcrumbs", breadcrumbs.joinToString(" > "), Field.Store.YES))
                        }

                    writer.addDocument(doc)
                } catch (e: Exception) {
                    logger.warn { "Ошибка индексации страницы ${page.location}: ${e.message}" }
                }
            }

            page.getChildren()?.let { children ->
                indexPages(children, book, writer, parentPath + page.getTitle())
            }
        }
    }

    @PreDestroy
    fun cleanup() {
        indexingScope.cancel()
        indexSearchers.values.forEach { searcher ->
            try {
                searcher.indexReader.close()
            } catch (e: Exception) {
                logger.warn { "Ошибка закрытия индекса: ${e.message}" }
            }
        }
        indexSearchers.clear()
    }

    fun isIndexReady(locale: String): Boolean = indexSearchers.containsKey(locale)

    fun search(
        query: String,
        locale: String = "ru",
        maxResults: Int = 50,
    ): SearchResponse {
        val searcher =
            indexSearchers[locale]
                ?: return SearchResponse(query, emptyList(), 0, 0) // Graceful degradation

        var results: List<SearchResult> = emptyList()
        var totalHits = 0L

        val searchTime =
            measureTimeMillis {
                try {
                    val parser = QueryParser("content", analyzer)
                    val luceneQuery = parser.parse(query)
                    val topDocs = searcher.search(luceneQuery, maxResults)

                    val highlighter =
                        Highlighter(
                            SimpleHTMLFormatter("<mark>", "</mark>"),
                            QueryScorer(luceneQuery),
                        )

                    results =
                        topDocs.scoreDocs.map { scoreDoc ->
                            val doc = searcher.doc(scoreDoc.doc)
                            val content = doc.get("content")

                            val highlights =
                                try {
                                    highlighter
                                        .getBestFragments(analyzer, "content", content, 5)
                                        .filter { it.isNotBlank() }
                                        .ifEmpty { listOf(content.take(300) + "...") }
                                } catch (e: Exception) {
                                    listOf(content.take(300) + "...")
                                }

                            SearchResult(
                                title = doc.get("title"),
                                location = doc.get("location"),
                                bookName = doc.get("bookName"),
                                score = scoreDoc.score,
                                highlights = highlights,
                                breadcrumbs = doc.get("breadcrumbs")?.split(" > ") ?: emptyList(),
                            )
                        }

                    totalHits = topDocs.totalHits.value
                } catch (e: Exception) {
                    logger.error(e) { "Ошибка поиска: $query" }
                }
            }

        return SearchResponse(
            query = query,
            results = results,
            totalHits = totalHits,
            searchTime = searchTime,
        )
    }

    private fun extractTextFromHtml(html: String): String =
        html
            .replace(Regex("<[^>]+>"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
}
