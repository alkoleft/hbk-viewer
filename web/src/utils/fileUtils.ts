/**
 * Утилиты для работы с файлами
 */

/**
 * Форматирует размер файла в читаемый вид
 * @param bytes - размер в байтах
 * @param locale - локаль для форматирования (по умолчанию 'ru')
 * @returns отформатированная строка с размером файла
 */
export function formatFileSize(bytes: number, locale: string = 'ru'): string {
  if (bytes < 1024) {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(bytes)} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}
