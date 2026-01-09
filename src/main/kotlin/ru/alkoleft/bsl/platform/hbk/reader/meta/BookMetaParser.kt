/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.bsl.platform.hbk.reader.meta

import io.github.oshai.kotlinlogging.KotlinLogging
import ru.alkoleft.bsl.platform.hbk.exceptions.PageDescriptionParsingError
import ru.alkoleft.bsl.platform.hbk.reader.toc.PeekableIterator
import ru.alkoleft.bsl.platform.hbk.reader.toc.Tokenizer

private val logger = KotlinLogging.logger {}

/**
 * Парсер для разбора описания страницы (книги) в HBK файлах.
 *
 * Этот класс отвечает за парсинг бинарных данных описания страницы HBK файлов
 * платформы 1С:Предприятие. Он преобразует бинарные данные в текстовый формат
 * и затем токенизирует и разбирает структуру описания страницы.
 *
 * Основные возможности:
 * - Парсинг бинарных данных описания страницы
 * - Токенизация текстового содержимого
 * - Извлечение имени книги, имени файла и тегов
 *
 * @see BookMeta для представления разобранного описания страницы
 * @see ru.alkoleft.bsl.platform.hbk.reader.toc.Tokenizer для токенизации содержимого
 * @see ru.alkoleft.bsl.platform.hbk.reader.toc.PeekableIterator для навигации по токенам
 */
internal class BookMetaParser {
    /**
     * Парсит бинарные данные и возвращает описание страницы.
     *
     * @param bytes Бинарные данные описания страницы
     * @return Описание страницы
     */
    fun parseContent(bytes: ByteArray): BookMeta {
        logger.debug { "Чтение из ByteArray, размер: ${bytes.size}" }
        val content = bytes.toString(Charsets.UTF_8)
        return parseContent(content)
    }

    /**
     * Парсит строку содержимого и возвращает описание страницы.
     *
     * @param content Текстовое содержимое описания страницы
     * @return Описание страницы
     */
    fun parseContent(content: String): BookMeta {
        logger.debug { "Токенизация содержимого..." }
        val tokens = Tokenizer.tokenize(content)
        logger.debug { "Токенов получено: ${tokens.size}" }
        logger.debug { "Первые 20 токенов: ${tokens.take(20)}" }
        val iterator = PeekableIterator(tokens.iterator())
        return parsePageDescription(iterator)
    }

    /**
     * Парсит структуру описания страницы.
     *
     * Формат:
     * {number,"bookName",
     *  {number,number,{"language","fileName"}},
     *  tagCount,"tag1",{number,number},"tag2",...,0}
     */
    private fun parsePageDescription(iterator: PeekableIterator<String>): BookMeta {
        logger.debug { "Парсинг PageDescription..." }
        expectToken(iterator, "{", "PageDescription: ожидался '{'")
        val type = parseNumber(iterator, "PageDescription: ожидалось число type")
        logger.debug { "PageDescription: type=$type" }
        val bookName = parseString(iterator, "PageDescription: ожидалось bookName")
        logger.debug { "PageDescription: bookName=$bookName" }
        val fileName = parseFileName(iterator)
        logger.debug { "PageDescription: fileName=$fileName" }
        val tagCount = parseNumber(iterator, "PageDescription: ожидалось число tagCount")
        logger.debug { "PageDescription: tagCount=$tagCount" }
        val tags =
            if (tagCount > 0) {
                parseTags(iterator, tagCount)
            } else {
                emptyList()
            }
        logger.debug { "PageDescription: tags=$tags" }
        val trailingZero = parseNumber(iterator, "PageDescription: ожидался завершающий ноль")
        if (trailingZero != 0) {
            throw PageDescriptionParsingError("PageDescription: ожидался завершающий ноль, получено: $trailingZero")
        }
        expectToken(iterator, "}", "PageDescription: ожидался '}' в конце")
        return BookMeta(
            bookName = bookName,
            description = fileName,
            tags = tags,
        )
    }

    /**
     * Парсит объект файла и извлекает имя файла.
     *
     * Формат: {number,number,{"language","fileName"}}
     */
    private fun parseFileName(iterator: PeekableIterator<String>): String {
        logger.debug { "  [FileName] Начало парсинга..." }
        expectToken(iterator, "{", "FileName: ожидался '{'")
        val number1 = parseNumber(iterator, "FileName: ожидалось число number1")
        val number2 = parseNumber(iterator, "FileName: ожидалось число number2")
        logger.debug { "  [FileName] number1=$number1, number2=$number2" }
        expectToken(iterator, "{", "FileName: ожидался '{' для объекта имени")
        val language = parseString(iterator, "FileName: ожидался language")
        val fileName = parseString(iterator, "FileName: ожидался fileName")
        logger.debug { "  [FileName] language=$language, fileName=$fileName" }
        expectToken(iterator, "}", "FileName: ожидался '}' в конце объекта имени")
        expectToken(iterator, "}", "FileName: ожидался '}' в конце объекта файла")
        return fileName
    }

    /**
     * Парсит список тегов.
     *
     * Формат: "tag1",{number,number},"tag2",{number,number},...,"tagN",{number,number}
     */
    private fun parseTags(
        iterator: PeekableIterator<String>,
        count: Int,
    ): List<String> {
        logger.debug { "  [Tags] Начало парсинга, count=$count..." }
        val tags = mutableListOf<String>()
        for (i in 0 until count) {
            val tag = parseString(iterator, "Tags: ожидался тег #${i + 1}")
            logger.debug { "  [Tags] tag[$i]=$tag" }
            tags.add(tag)
            parseNumberPair(iterator)
        }
        return tags
    }

    /**
     * Парсит пару чисел в формате {number,number}.
     */
    private fun parseNumberPair(iterator: PeekableIterator<String>) {
        logger.debug { "    [NumberPair] Начало парсинга..." }
        expectToken(iterator, "{", "NumberPair: ожидался '{'")
        val number1 = parseNumber(iterator, "NumberPair: ожидалось число number1")
        val number2 = parseNumber(iterator, "NumberPair: ожидалось число number2")
        logger.debug { "    [NumberPair] number1=$number1, number2=$number2" }
        expectToken(iterator, "}", "NumberPair: ожидался '}' в конце")
    }

    /**
     * Парсит число
     */
    private fun parseNumber(
        iterator: PeekableIterator<String>,
        context: String,
    ): Int {
        val token =
            if (iterator.hasNext()) iterator.next() else throw PageDescriptionParsingError("$context: не найден токен (конец данных)")
        return token.toIntOrNull() ?: throw PageDescriptionParsingError("$context: ожидалось число, получено: '$token'")
    }

    /**
     * Парсит строку
     */
    private fun parseString(
        iterator: PeekableIterator<String>,
        context: String,
    ): String {
        val token =
            if (iterator.hasNext()) iterator.next() else throw PageDescriptionParsingError("$context: не найден токен (конец данных)")
        if (!token.startsWith("\"") || !token.endsWith("\"")) {
            throw PageDescriptionParsingError("$context: ожидалась строка в кавычках, получено: '$token'")
        }
        return token.substring(1, token.length - 1)
    }

    /**
     * Проверяет, что следующий токен соответствует ожидаемому
     */
    private fun expectToken(
        iterator: PeekableIterator<String>,
        expected: String,
        context: String,
    ) {
        val token =
            if (iterator.hasNext()) iterator.next() else throw PageDescriptionParsingError("$context: не найден токен (конец данных)")
        if (token != expected) {
            throw PageDescriptionParsingError("$context: ожидался '$expected', получен '$token'")
        }
    }
}
