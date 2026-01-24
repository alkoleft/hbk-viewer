export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Ошибка сети. Проверьте подключение к интернету.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleApiError(error: unknown, endpoint: string): never {
  if (error instanceof Response) {
    throw new ApiError(
      `Ошибка при запросе к ${endpoint}: ${error.statusText}`,
      error.status,
      endpoint
    );
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new NetworkError();
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error('Неизвестная ошибка');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
}
