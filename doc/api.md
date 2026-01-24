# API Documentation

Документация REST API для HBK Reader backend.

## Base URL

```
http://localhost:8080/api
```

## Controllers

### AppController

Контроллер для получения информации о приложении.

**Base path:** `/api/app`

#### GET /api/app/info

Получает информацию о приложении: версии и доступные локали.

**Response:**
```json
{
  "version": {
    "application": "string",
    "platform": "string"
  },
  "availableLocales": ["string"]
}
```

**Example:**
```bash
curl http://localhost:8080/api/app/info
```

---

### BooksController

Контроллер для работы с книгами документации.

**Base path:** `/api/books`

#### GET /api/books

Получает список всех доступных книг.

**Response:**
```json
[
  {
    "filename": "string",
    "path": "string", 
    "size": 0,
    "meta": {
      "title": "string",
      "description": "string"
    },
    "locale": "string"
  }
]
```

#### GET /api/books/{book}/children

Получает дочерние элементы корня книги.

**Parameters:**
- `book` (path) - имя файла книги
- `depth` (query, optional) - глубина вложенности (должна быть >= 0)

**Response:**
```json
[
  {
    "title": "string",
    "pagePath": "string",
    "path": [0],
    "children": [],
    "hasChildren": true
  }
]
```

#### GET /api/books/{book}/children/**

Получает дочерние элементы указанной страницы.

**Parameters:**
- `book` (path) - имя файла книги
- `**` (path) - путь к странице
- `depth` (query, optional) - глубина вложенности (должна быть >= 0)

**Response:** Аналогично `/children`

#### GET /api/books/{book}/**

Получает содержимое страницы.

**Parameters:**
- `book` (path) - имя файла книги  
- `**` (path) - путь к странице

**Response:**
```json
{
  "filename": "string",
  "pageName": "string", 
  "content": "string"
}
```

**Example:**
```bash
curl "http://localhost:8080/api/books/shcntx_ru.hbk/objects/Global%20context.html"
```

---

### TocController

Контроллер для работы с глобальным оглавлением.

**Base path:** `/api/toc`

#### GET /api/toc/**

Универсальный endpoint для работы с оглавлением. Если путь не указан, возвращает корневые элементы, иначе - дочерние элементы указанного раздела.

**Headers:**
- `Accept-Language` (optional) - код локали (по умолчанию "root")

**Parameters:**
- `**` (path, optional) - путь к разделу (если не указан, возвращает корневые элементы)
- `depth` (query, optional) - глубина вложенности (должна быть >= 0)

**Response:**
```json
[
  {
    "title": "string",
    "pagePath": "string", 
    "path": [0],
    "children": [],
    "hasChildren": true
  }
]
```

**Examples:**
```bash
# Получить корневые элементы оглавления для локали по умолчанию
curl http://localhost:8080/api/toc/

# Получить корневые элементы для русской локали
curl -H "Accept-Language: ru" http://localhost:8080/api/toc/

# Получить корневые элементы с ограниченной глубиной
curl -H "Accept-Language: ru" "http://localhost:8080/api/toc/?depth=2"

# Получить дочерние элементы раздела
curl -H "Accept-Language: ru" "http://localhost:8080/api/toc/section/subsection"

# Получить дочерние элементы с ограниченной глубиной
curl -H "Accept-Language: ru" "http://localhost:8080/api/toc/section/subsection?depth=1"
```

## Data Models

### AppInfo
```typescript
interface AppInfo {
  version: VersionInfo;
  availableLocales: string[];
}
```

### BookInfo
```typescript
interface BookInfo {
  filename: string;
  path: string;
  size: number;
  meta: BookMeta | null;
  locale: string;
}
```

### PageDto
```typescript
interface PageDto {
  title: string;
  pagePath: string;
  path: number[];
  children: PageDto[];
  hasChildren: boolean;
}
```

### FileContent
```typescript
interface FileContent {
  filename: string;
  pageName: string;
  content: string;
}
```

### FileStructure
```typescript
interface FileStructure {
  filename: string;
  pages: PageDto[];
}
```

## Error Responses

### 400 Bad Request
Неверные параметры запроса:
- Отрицательное значение параметра `depth`
- Некорректное значение локали в заголовке `Accept-Language`

### 404 Not Found
Запрашиваемый ресурс не найден (книга, страница).

### 500 Internal Server Error
Внутренняя ошибка сервера.

## Usage Examples

### Получение списка книг
```javascript
const response = await fetch('/api/books');
const books = await response.json();
```

### Получение содержимого страницы
```javascript
const response = await fetch('/api/books/platform.hbk/index.html');
const content = await response.json();
```

### Получение оглавления с указанием локали
```javascript
const response = await fetch('/api/toc', {
  headers: {
    'Accept-Language': 'ru'
  }
});
const toc = await response.json();
```

### Получение дочерних элементов раздела
```javascript
const response = await fetch('/api/toc/section/subsection?depth=2', {
  headers: {
    'Accept-Language': 'ru'
  }
});
const children = await response.json();
```
