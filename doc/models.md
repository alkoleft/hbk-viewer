# Модели данных

Описание основных моделей данных, используемых в HBK Reader.

## DTO (Data Transfer Objects)

### PageDto
Модель страницы для передачи через API.

```kotlin
data class PageDto(
    val title: String,
    val pagePath: String,
    val path: List<Int> = emptyList(),
    val children: List<PageDto> = emptyList(),
    val hasChildren: Boolean = false,
)
```

**Поля:**
- `title` - заголовок страницы
- `pagePath` - путь к HTML файлу страницы
- `path` - путь от корня до страницы (массив индексов)
- `children` - дочерние страницы
- `hasChildren` - флаг наличия дочерних элементов

**Методы создания:**
- `from()` - полное преобразование с рекурсией
- `fromLite()` - без дочерних элементов (оптимизация)
- `fromWithDepth()` - с ограниченной глубиной

### FileStructure
Структура файла с оглавлением.

```kotlin
data class FileStructure(
    val filename: String,
    val pages: List<PageDto>,
)
```

### FileContent
Содержимое страницы документации.

```kotlin
data class FileContent(
    val filename: String,
    val pageName: String,
    val content: String,
)
```

### AppInfo
Информация о приложении.

```kotlin
data class AppInfo(
    val version: VersionInfo,
    val availableLocales: List<String>,
)
```

### BookInfo
Информация о HBK книге.

```kotlin
data class BookInfo(
    val filename: String,
    val path: String,
    val size: Long,
    val meta: BookMeta?,
    val locale: String,
)
```

### VersionInfo
Информация о версиях.

```kotlin
data class VersionInfo(
    val applicationVersion: String,
    val platformVersion: String?,
)
```

## Доменные модели

### Page
Базовая модель страницы документации.

```kotlin
data class Page(
    val title: DoubleLanguageString,
    val htmlPath: String,
    val children: MutableList<Page> = mutableListOf(),
)
```

### Toc
Оглавление документации с методами поиска и навигации.

```kotlin
class Toc {
    val pages: List<Page>
    
    // Методы поиска
    fun findPageByHtmlPath(pagePath: String): Page?
    fun findPageByPath(path: List<Int>): Page?
    fun getChildrenByHtmlPath(pagePath: String): List<Page>
    fun getChildrenByPath(path: List<Int>): List<Page>
    fun searchPages(query: String): List<Page>
}
```

### BookMeta
Метаданные HBK книги.

```kotlin
data class BookMeta(
    val bookName: String,
    val description: String,
    val tags: List<String>,
)
```

### DoubleLanguageString
Строка на двух языках (русский/английский).

```kotlin
data class DoubleLanguageString(
    val en: String,
    val ru: String,
)
```

## Особенности использования

- **PageDto** поддерживает три режима создания для оптимизации загрузки больших оглавлений
- **Toc** предоставляет методы поиска как по HTML пути, так и по индексному пути
- **DoubleLanguageString** используется для поддержки двуязычной документации
- Все DTO модели являются immutable data классами
