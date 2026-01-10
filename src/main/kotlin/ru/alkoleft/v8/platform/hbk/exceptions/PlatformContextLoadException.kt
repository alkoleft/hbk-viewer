/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the mcp-bsl-context project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.hbk.exceptions

/**
 * Исключение, возникающее при ошибках загрузки/чтения контекста платформы.
 *
 * Используется для ошибок, связанных с чтением HBK контейнера и разбором страниц документации.
 *
 * @param message Сообщение об ошибке
 * @param cause Причина исключения
 */
class PlatformContextLoadException(
    message: String,
    cause: Throwable? = null,
) : Exception(message, cause)
