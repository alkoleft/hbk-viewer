import { describe, it, expect } from 'vitest';
import { ApiError, NetworkError, getErrorMessage, handleApiError } from './error-handler';

describe('error-handler', () => {
  describe('ApiError', () => {
    it('should create ApiError with details', () => {
      const error = new ApiError('Test error', 404, '/api/test');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/api/test');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('NetworkError', () => {
    it('should create NetworkError with default message', () => {
      const error = new NetworkError();
      expect(error.message).toContain('Ошибка сети');
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from ApiError', () => {
      const error = new ApiError('API failed', 500);
      expect(getErrorMessage(error)).toBe('API failed');
    });

    it('should extract message from NetworkError', () => {
      const error = new NetworkError();
      expect(getErrorMessage(error)).toContain('Ошибка сети');
    });

    it('should extract message from generic Error', () => {
      const error = new Error('Generic error');
      expect(getErrorMessage(error)).toBe('Generic error');
    });

    it('should return default message for unknown error', () => {
      expect(getErrorMessage('string error')).toBe('Произошла неизвестная ошибка');
    });
  });

  describe('handleApiError', () => {
    it('should throw ApiError for Response', () => {
      const response = new Response(null, { status: 404, statusText: 'Not Found' });
      expect(() => handleApiError(response, '/api/test')).toThrow(ApiError);
    });

    it('should throw NetworkError for fetch TypeError', () => {
      const error = new TypeError('fetch failed');
      expect(() => handleApiError(error, '/api/test')).toThrow(NetworkError);
    });

    it('should rethrow Error instances', () => {
      const error = new Error('Custom error');
      expect(() => handleApiError(error, '/api/test')).toThrow('Custom error');
    });
  });
});
