plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.kotlin.spring)
    application
    alias(libs.plugins.git.versioning)
    alias(libs.plugins.gradle.git.properties)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    id("maven-publish")
    id("jacoco")
    alias(libs.plugins.ktlint)
    alias(libs.plugins.kotest)
}

group = "io.github.alkoleft"
version = "0.3.0"

gitVersioning.apply {
    refs {
        considerTagsOnBranches = true
        tag("v(?<tagVersion>[0-9].*)") {
            version = "\${ref.tagVersion}\${dirty}"
        }
        branch(".+") {
            version = "\${ref}-\${commit.short}\${dirty}"
        }
    }

    rev {
        version = "\${commit.short}\${dirty}"
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict", "-java-parameters", "-Xemit-jvm-type-annotations")
    }
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

repositories {
    mavenCentral()
    mavenLocal()
    maven(url = "https://jitpack.io")
}

dependencies {
    // Kotlin Standard Library
    implementation(libs.bundles.kotlin)
    implementation("org.apache.commons", "commons-compress", "1.27.1")
    implementation("com.mohamedrejeb.ksoup:ksoup-html:0.6.0")

    // Spring Boot with Kotlin
    implementation(libs.bundles.spring.boot) {
        exclude(group = "org.springframework.boot", module = "spring-boot-starter-tomcat")
    }
    implementation(libs.spring.boot.starter.undertow)

    // JSON/XML with Kotlin support
    implementation(libs.bundles.jackson)

    // Logging
    implementation(libs.bundles.logging)

    // Tests
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.bundles.kotest)
    testImplementation(libs.slf4j.log4j12)
}

tasks.test {
    useJUnitPlatform()

    testLogging {
        events("passed", "skipped", "failed", "standard_error")
    }
}

tasks.jar {
    enabled = false
    archiveClassifier.set("plain")
}

// Определяем менеджер пакетов (pnpm приоритетнее, если доступен)
val packageManager =
    if (file("web/pnpm-lock.yaml").exists()) {
        "pnpm"
    } else if (file("web/yarn.lock").exists()) {
        "yarn"
    } else {
        "npm"
    }

// Задача для сборки web-части
val buildWeb =
    tasks.register<Exec>("buildWeb") {
        group = "build"
        description = "Сборка web-части приложения"
        workingDir = file("web")

        // Используем sh/bash для выполнения команды, чтобы PATH работал правильно
        // Это позволяет находить команды, установленные в пользовательском окружении
        if (System.getProperty("os.name").lowercase().contains("win")) {
            commandLine = listOf("cmd", "/c", "$packageManager run build")
        } else {
            // Для Unix-систем используем sh с явным PATH
            val pathEnv = System.getenv("PATH") ?: ""
            val homeDir = System.getenv("HOME") ?: ""
            val customPath =
                if (homeDir.isNotEmpty()) {
                    "$pathEnv:$homeDir/.local/bin:$homeDir/.local/share/pnpm"
                } else {
                    pathEnv
                }

            environment("PATH", customPath)
            // Используем sh для выполнения команды
            commandLine = listOf("sh", "-c", "$packageManager run build")
        }

        // Проверяем наличие node_modules перед выполнением
        doFirst {
            val nodeModules = file("web/node_modules")
            if (!nodeModules.exists()) {
                throw GradleException("node_modules не найден. Запустите '$packageManager install' в директории web/")
            }
        }

        // Очищаем директорию перед сборкой
        doFirst {
            val distDir = file("web/dist")
            if (distDir.exists()) {
                delete(distDir)
            }
        }
    }

// Задача для копирования собранных файлов в ресурсы Spring Boot
val copyWebAssets =
    tasks.register<Copy>("copyWebAssets") {
        group = "build"
        description = "Копирование собранных web-файлов в ресурсы Spring Boot"
        dependsOn(buildWeb)

        from("web/dist") {
            include("**/*")
        }
        into("src/main/resources/static")

        // Очищаем директорию перед копированием
        doFirst {
            val staticDir = file("src/main/resources/static")
            if (staticDir.exists()) {
                delete(staticDir)
            }
            staticDir.mkdirs()
        }
    }

tasks.bootJar {
    enabled = true
    archiveClassifier.set("")
    mainClass.set("ru.alkoleft.v8.platform.HbkReaderApplicationKt")
    dependsOn(copyWebAssets)
}

// Исправление зависимостей для задач распространения
tasks.named("bootDistZip") {
    dependsOn("bootJar")
}

tasks.named("bootDistTar") {
    dependsOn("bootJar")
}

tasks.named("bootStartScripts") {
    dependsOn("bootJar")
}

tasks.named("startScripts") {
    dependsOn("bootJar")
}

publishing {
    repositories {
        maven {
            name = "hbk-reader"
            url = uri("https://maven.pkg.github.com/alkoleft/hbk-reader")
            credentials {
                username = System.getenv("GITHUB_ACTOR")
                password = System.getenv("GITHUB_TOKEN")
            }
        }
    }
    publications {
        register<MavenPublication>("gpr") {
            from(components["java"])
        }
    }
}

// Настройка JaCoCo для генерации отчёта покрытия тестов
jacoco {
    toolVersion = libs.versions.jacoco.get()
}

ktlint {
    version = libs.versions.ktlint.get()
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
        csv.required.set(false)
    }
}

tasks.named("build") {
    dependsOn(copyWebAssets)
}

tasks.named("processResources") {
    mustRunAfter(copyWebAssets)
}
