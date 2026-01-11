# Запуск в Docker

Приложение можно запустить в Docker контейнере с монтированием каталога с HBK файлами.

## Сборка Docker образа

```bash
docker build -t hbk-reader:latest .
```

## Запуск с помощью Docker

```bash
docker run -d \
  --name hbk-reader \
  -p 8080:8080 \
  -v /opt/1cv8/x86_64/8.5.1.189/:/data/hbk:ro \
  hbk-reader:latest
```

## Запуск с помощью Docker Compose

1. Отредактируйте файл `docker-compose.yml` и укажите путь к вашим HBK файлам:

   ```yaml
   volumes:
     - /opt/1cv8/x86_64/8.5.1.189/:/data/hbk:ro
   ```

2. Запустите контейнер:

   ```bash
   docker-compose up -d
   ```

3. Приложение будет доступно по адресу `http://localhost:8080`

## Настройка пути к HBK файлам

Путь к каталогу с HBK файлами можно указать несколькими способами:

1. **Через монтирование тома** (рекомендуется):
   - Файлы монтируются в `/data/hbk` внутри контейнера
   - Приложение автоматически использует этот путь

2. **Через переменную окружения**:

   ```bash
   docker run -d \
     --name hbk-reader \
     -p 8080:8080 \
     -v /opt/1cv8/x86_64/8.5.1.189/:/1cv8/x86_64/8.5.1.189:ro \
     -e HBK_FILES_DIRECTORY=/1cv8/x86_64/8.5.1.189 \
     hbk-reader:latest
   ```

3. **Через аргументы командной строки**:

   ```bash
   docker run -d \
     --name hbk-reader \
     -p 8080:8080 \
     -v /opt/1cv8/x86_64/8.5.1.189/:/1cv8/x86_64/8.5.1.189:ro \
     hbk-reader:latest \
     --platform-path /1cv8/x86_64/8.5.1.189
   ```
