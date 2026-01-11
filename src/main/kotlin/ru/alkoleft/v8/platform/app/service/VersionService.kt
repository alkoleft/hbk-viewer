/*
 * Copyright (c) 2025-2026 alkoleft. All rights reserved.
 * This file is part of the hbk-reader project.
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 */

package ru.alkoleft.v8.platform.app.service

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Service
import ru.alkoleft.v8.platform.HbkReaderApplication
import ru.alkoleft.v8.platform.app.controller.dto.VersionInfo
import ru.alkoleft.v8.platform.app.util.PlatformVersionDetector
import java.nio.file.Path
import java.util.jar.Attributes
import java.util.jar.Manifest

private val logger = KotlinLogging.logger { }

/**
 * Сервис для получения версии приложения.
 *
 * Версия определяется из:
 * 1. Manifest файла JAR (Implementation-Version или Specification-Version)
 * 2. Если версия не найдена, возвращается "unknown"
 */
@Service
class VersionService(
    private val fileScannerService: HbkFileScannerService
) {
    val versionsInfo: VersionInfo by lazy {
        VersionInfo(
            applicationVersion = getApplicationVersion(),
            platformVersion = getPlatformVersion(fileScannerService.hbkDirectory),
        )
    }

    /**
     * Получает версию приложения.
     *
     * @return Версия приложения или "unknown", если версия не может быть определена
     */
    fun getApplicationVersion(): String {
        return try {
            val packageName = HbkReaderApplication::class.java.`package`
            val implementationVersion = packageName.implementationVersion
            if (implementationVersion != null) {
                implementationVersion
            } else {
                // Пробуем получить из manifest
                val manifest = getManifest()
                manifest?.mainAttributes?.getValue(Attributes.Name.IMPLEMENTATION_VERSION)
                    ?: manifest?.mainAttributes?.getValue(Attributes.Name.SPECIFICATION_VERSION)
                    ?: "unknown"
            }
        } catch (e: Exception) {
            logger.warn(e) { "Не удалось определить версию приложения" }
            "unknown"
        }
    }

    fun getPlatformVersion(path: String) =
        try {
            val platformDir = Path.of(path)
            PlatformVersionDetector.detectVersion(platformDir)
        } catch (e: Exception) {
            logger.warn(e) { "Не удалось определить версию платформы 1С из пути: $path" }
            null
        }

    /**
     * Получает Manifest файл из JAR.
     */
    private fun getManifest(): Manifest? {
        return try {
            val className = HbkReaderApplication::class.java.simpleName + ".class"
            val classPath = HbkReaderApplication::class.java.getResource(className)?.toString()
            if (classPath != null && classPath.startsWith("jar")) {
                val manifestPath = classPath.substring(0, classPath.lastIndexOf("!") + 1) + "/META-INF/MANIFEST.MF"
                val manifestUrl = java.net.URI(manifestPath).toURL()
                Manifest(manifestUrl.openStream())
            } else {
                null
            }
        } catch (e: Exception) {
            logger.debug(e) { "Не удалось прочитать manifest файл" }
            null
        }
    }

}
