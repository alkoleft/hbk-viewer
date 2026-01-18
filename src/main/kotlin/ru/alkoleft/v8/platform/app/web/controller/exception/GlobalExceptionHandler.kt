/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.web.controller.exception

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import ru.alkoleft.v8.platform.hbk.exceptions.PlatformContextLoadException
import java.util.stream.Collectors

private val logger = KotlinLogging.logger { }

/**
 * Глобальный обработчик исключений для REST API.
 *
 * Обеспечивает единообразную обработку исключений и возврат понятных ошибок клиенту.
 */
@RestControllerAdvice(basePackages = ["ru.alkoleft.v8.platform.hbk.controller"])
class GlobalExceptionHandler {
    /**
     * Обрабатывает исключения, связанные с загрузкой контекста платформы.
     */
    @ExceptionHandler(PlatformContextLoadException::class)
    fun handlePlatformContextLoadException(ex: PlatformContextLoadException): ResponseEntity<ErrorResponse> {
        logger.warn(ex) { "Ошибка загрузки контекста платформы: ${ex.message}" }
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ErrorResponse(
                    error = "CONTEXT_LOAD_ERROR",
                    message = ex.message ?: "Ошибка загрузки контекста платформы",
                    status = HttpStatus.NOT_FOUND.value(),
                ),
            )
    }

    /**
     * Обрабатывает ошибки валидации параметров запроса.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors =
            ex.bindingResult
                .fieldErrors
                .stream()
                .map { "${it.field}: ${it.defaultMessage}" }
                .collect(Collectors.toList())

        logger.debug(ex) { "Ошибка валидации: $errors" }
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    error = "VALIDATION_ERROR",
                    message = "Ошибка валидации параметров запроса",
                    details = errors,
                    status = HttpStatus.BAD_REQUEST.value(),
                ),
            )
    }

    /**
     * Обрабатывает ошибки несоответствия типов параметров.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException::class)
    fun handleTypeMismatchException(ex: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponse> {
        logger.debug(ex) { "Ошибка типа параметра: ${ex.name} = ${ex.value}" }
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    error = "INVALID_PARAMETER_TYPE",
                    message = "Некорректный тип параметра '${ex.name}': требуется ${ex.requiredType?.simpleName}",
                    status = HttpStatus.BAD_REQUEST.value(),
                ),
            )
    }

    /**
     * Обрабатывает ошибки при отсутствии ресурса (404).
     */
    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgumentException(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        logger.debug(ex) { "Некорректный аргумент: ${ex.message}" }
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    error = "INVALID_ARGUMENT",
                    message = ex.message ?: "Некорректный аргумент",
                    status = HttpStatus.BAD_REQUEST.value(),
                ),
            )
    }

    /**
     * Обрабатывает все остальные необработанные исключения.
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error(ex) { "Необработанное исключение: ${ex.message}" }
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                ErrorResponse(
                    error = "INTERNAL_ERROR",
                    message = "Внутренняя ошибка сервера",
                    status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ),
            )
    }

    /**
     * DTO для ответа с ошибкой.
     */
    data class ErrorResponse(
        val error: String,
        val message: String,
        val status: Int,
        val details: List<String>? = null,
    )
}
