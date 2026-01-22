/**
 * Утилиты для обработки ошибок
 */

/**
 * Безопасно извлекает сообщение об ошибке из различных типов ошибок
 * @param error - ошибка любого типа
 * @param defaultMessage - сообщение по умолчанию, если не удалось извлечь
 * @returns строку с сообщением об ошибке
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string = 'Произошла ошибка'
): string {
  if (!error) {
    return defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== undefined && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return defaultMessage;
}
