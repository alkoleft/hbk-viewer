# Бинарный формат файлов HBK

## Обзор

Этот документ описывает низкоуровневую бинарную структуру HBK (Help Book) файлов платформы 1С:Предприятие. Для общего описания формата и содержимого HBK файлов см. [Формат файлов HBK](hbk-format.md).

## Структура HBK контейнера

HBK файл представляет собой бинарный контейнер с определенной структурой заголовков и блоков данных. Контейнер хранит набор **сущностей** (entities), каждая из которых имеет:

- **Имя** — строка в кодировке UTF-16LE
- **Данные** — бинарные данные, организованные в блоки

### Порядок байтов

Все числовые значения в HBK файле хранятся в формате **little-endian**.

## Заголовок контейнера

Заголовок контейнера занимает первые 16 байт файла и содержит следующие поля (по 4 байта каждое, INT32):

1. **Адрес первого свободного блока** (INT32)
   - Смещение, по которому начинается цепочка свободных блоков
   - Используется для управления свободным пространством в контейнере

2. **Размер блока по умолчанию** (INT32)
   - Блок может иметь произвольную длину, но значение по умолчанию можно использовать для добавления новых блоков

3. **Поле неизвестного назначения** (INT32)
   - Число, отражающее некоторую величину, как правило, совпадающую с количеством файлов в контейнере
   - На алгоритм интерпретации контейнера данное число никак не влияет, его можно игнорировать

4. **Зарезервированное поле** (INT32)
   - Всегда равно 0

## Блок оглавления контейнера (TOC блок)

После заголовка контейнера следует блок оглавления, который содержит список всех сущностей в контейнере.

### Заголовок блока

Каждый блок данных в HBK контейнере имеет заголовок следующего формата:

```
[CRLF]                    (2 байта) - Разделитель
[payload_size_hex]        (8 байт) - Размер полезной нагрузки в hex формате
[пробел]                  (1 байт)
[block_size_hex]          (8 байт) - Размер блока в hex формате
[пробел]                  (1 байт)
[next_block_hex]          (8 байт) - Адрес следующего блока в hex формате (или FFFFFFFF если последний)
[пробел]                  (1 байт)
[CRLF]                    (2 байта) - Разделитель
[данные блока]            (block_size байт)
```

**Пример заголовка блока:**
```
\r\n
00000100        (256 в hex)
 
00000100        (256 в hex)
 
FFFFFFFF        (нет следующего блока)
 
\r\n
[256 байт данных]
```

Блоки могут быть связаны в цепочку через указатель на следующий блок. Если `next_block_hex` равен `FFFFFFFF` (или `Int.MAX_VALUE`), это последний блок в цепочке.

### Структура TOC блока

TOC блок содержит список файловых записей (FileInfo). Каждая запись занимает 12 байт (3 × INT32):

```
[header_address]    (INT32, 4 байта) - Адрес заголовка файла
[body_address]      (INT32, 4 байта) - Адрес тела файла
[reserved]          (INT32, 4 байта) - Зарезервированное поле (должно быть Int.MAX_VALUE)
```

Количество записей определяется как `размер_данных_TOC_блока / 12`.

## Извлечение сущностей

### Чтение имени файла

Для каждой записи в TOC блоке имя файла читается из заголовка файла по адресу `header_address`:

1. Пропустить CRLF (2 байта)
2. Прочитать размер полезной нагрузки (payload size) — 8 байт в hex формате
3. Пропустить пробел (1 байт)
4. Пропустить остальные поля заголовка (40 байт):
   - block_size (8 байт hex + 1 байт пробел)
   - next_block (8 байт hex + 1 байт пробел)
   - CRLF (2 байта)
   - Дополнительные поля (8 + 8 + 4 = 20 байт)
5. Прочитать имя файла: `(payload_size - 24)` байт в кодировке UTF-16LE

### Чтение тела файла

Тело файла читается по адресу `body_address`:

1. Прочитать заголовок блока (см. формат выше)
2. Прочитать данные блока, учитывая цепочку блоков:
   - Если есть следующий блок (`next_block != FFFFFFFF`), перейти к нему
   - Повторять до конца цепочки
3. Объединить все данные из цепочки блоков

## Процесс чтения HBK файла

Полный процесс чтения HBK файла включает следующие шаги:

### 1. Чтение заголовка контейнера

```kotlin
buffer.order(ByteOrder.LITTLE_ENDIAN)
val firstFreeBlock = buffer.int      // Адрес первого свободного блока
val defaultBlockSize = buffer.int    // Размер блока по умолчанию
val unknownField = buffer.int        // Поле неизвестного назначения
val reserved = buffer.int            // Зарезервированное поле (0)
```

### 2. Чтение блока оглавления контейнера (TOC блок)

```kotlin
// Пропустить CRLF
skipBlock(buffer, 2)

// Прочитать размеры блока
val payloadSize = getLongString(buffer)  // Размер полезной нагрузки
buffer.get()                              // Пробел
val blockSize = getLongString(buffer)     // Размер блока
buffer.get()                              // Пробел
val nextBlock = getLongString(buffer)     // Адрес следующего блока
skipBlock(buffer, 3)                      // Пробел + CRLF

// Прочитать данные TOC блока
val fileInfos = readBlock(buffer, Block(payloadSize, blockSize, nextBlock))
```

### 3. Парсинг списка файловых записей

```kotlin
val fileInfosBuffer = ByteBuffer.wrap(fileInfos).order(ByteOrder.LITTLE_ENDIAN)
val count = fileInfosBuffer.capacity() / 12  // 12 байт на запись

for (i in 1..count) {
    val headerAddress = fileInfosBuffer.int
    val bodyAddress = fileInfosBuffer.int
    val reserved = fileInfosBuffer.int
    
    if (reserved != Int.MAX_VALUE) {
        throw RuntimeException("Invalid file info entry")
    }
    
    val name = getHbkFileName(buffer, headerAddress)
    entities[name] = bodyAddress
}
```

### 4. Извлечение содержимого сущностей

Для каждой сущности тело файла извлекается по адресу из FileInfo:

```kotlin
fun getEntity(name: String): ByteArray? {
    val bodyAddress = entities[name] ?: return null
    return getHbkFileBody(buffer, bodyAddress)
}
```

## Формат блоков данных

### Структура заголовка блока

Каждый блок данных имеет заголовок следующего формата:

| Поле | Размер | Описание |
|------|--------|-----------|
| CRLF | 2 байта | Разделитель начала блока |
| Payload Size | 8 байт (hex строка) | Размер полезной нагрузки в шестнадцатеричном формате |
| Пробел | 1 байт | Разделитель |
| Block Size | 8 байт (hex строка) | Размер текущего блока в шестнадцатеричном формате |
| Пробел | 1 байт | Разделитель |
| Next Block | 8 байт (hex строка) | Адрес следующего блока или FFFFFFFF |
| Пробел | 1 байт | Разделитель |
| CRLF | 2 байта | Разделитель конца заголовка |
| Данные | block_size байт | Полезная нагрузка блока |

### Цепочки блоков

Блоки могут быть связаны в цепочку для хранения данных, превышающих размер одного блока:

1. Первый блок содержит часть данных
2. Если данных больше, чем размер блока, в поле `next_block` указывается адрес следующего блока
3. Процесс повторяется до тех пор, пока все данные не будут сохранены
4. Последний блок имеет `next_block = FFFFFFFF`

### Пример чтения цепочки блоков

```kotlin
fun readBlock(buffer: ByteBuffer, block: Block): ByteArray {
    val data = ByteArray(block.payloadSize)
    var currentBlock = block
    var offset = 0
    
    do {
        val length = min(currentBlock.blockSize, block.payloadSize - offset)
        buffer.get(data, offset, length)
        offset += length
        
        if (currentBlock.hasNextBlock) {
            buffer.position(currentBlock.nextBlockPosition)
            currentBlock = readBlockHeader(buffer)
        } else {
            break
        }
    } while (true)
    
    return data
}
```

## Кодировки

Различные части HBK файла используют разные кодировки:

- **Имена сущностей:** UTF-16LE (16-битная кодировка, little-endian)
- **Заголовки блоков:** ASCII (для hex строк и разделителей)
- **Содержимое PackBlock:** UTF-8 (после распаковки из ZIP)
- **Содержимое Book:** UTF-8
- **HTML-файлы в FileStorage:** UTF-8 (или кодировка, указанная в HTML)

## Примеры

### Пример чтения заголовка контейнера

```kotlin
val buffer = FileChannel.map(FileChannel.MapMode.READ_ONLY, 0, fileSize)
buffer.order(ByteOrder.LITTLE_ENDIAN)

// Чтение заголовка (16 байт)
val firstFreeBlock = buffer.int      // 0x00000000
val defaultBlockSize = buffer.int    // 0x00000100 (256)
val unknownField = buffer.int        // 0x00000003 (3 файла)
val reserved = buffer.int            // 0x00000000
```

### Пример чтения блока

```kotlin
// Пропустить CRLF
buffer.position(buffer.position() + 2)

// Прочитать размеры (как hex строки)
val payloadSizeHex = ByteArray(8)
buffer.get(payloadSizeHex)
val payloadSize = String(payloadSizeHex).toLong(16).toInt()

// Пропустить пробел
buffer.get()

// Аналогично для blockSize и nextBlock
```

## См. также

- [Формат файлов HBK](hbk-format.md) — общее описание формата и содержимого
