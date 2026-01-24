# Многоступенчатая сборка для оптимизации размера образа
# Этап 1: Сборка приложения
FROM gradle:8.5-jdk17 AS build

WORKDIR /app

# Устанавливаем Node.js и pnpm для сборки web-части
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем файлы конфигурации Gradle
COPY gradle/ ./gradle/
COPY gradlew ./
COPY gradlew.bat ./
COPY build.gradle.kts ./
COPY settings.gradle.kts ./

# Устанавливаем права на выполнение для gradlew
RUN chmod +x ./gradlew

# Копируем исходный код
COPY src/ ./src/
COPY web/ ./web/

# Устанавливаем зависимости для web-части
WORKDIR /app/web
RUN pnpm install --frozen-lockfile

# Возвращаемся в корневую директорию
WORKDIR /app

# Собираем приложение (включая web-часть)
# Отключаем generateGitProperties, так как Git репозиторий не доступен в Docker
RUN ./gradlew bootJar --no-daemon -x generateGitProperties

# Этап 2: Финальный образ
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Создаем пользователя для запуска приложения (безопасность)
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Копируем собранный JAR из этапа сборки
COPY --from=build /app/build/libs/*.jar /app/hbk-reader.jar

# Создаем директорию для монтирования HBK файлов
RUN mkdir -p /data/hbk && chown -R appuser:appuser /data/hbk

# Переключаемся на непривилегированного пользователя
USER appuser

# Открываем порт приложения
EXPOSE 8080

# Переменная окружения для пути к каталогу с HBK файлами
# Можно переопределить при запуске контейнера
ENV HBK_FILES_DIRECTORY=/data/hbk

# Точка входа для запуска приложения
ENTRYPOINT ["java", "-jar", "/app/hbk-reader.jar"]

# По умолчанию передаем путь к каталогу с HBK файлами
CMD ["server", "--path", "/data/hbk"]
