import {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateRequest,
} from '@infrastructure/validation/middleware';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// Mock Express objects
const mockRequest = (data: any, target: 'body' | 'params' | 'query' = 'body') => {
  const req = {} as Request;
  req[target] = data;
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate (consolidated function)', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    });

    it('should validate body successfully', () => {
      const req = mockRequest({ name: 'John', age: 25 });
      const res = mockResponse();
      const middleware = validate('body', testSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'John', age: 25 });
    });

    it('should validate params successfully', () => {
      const req = mockRequest({ name: 'John', age: 25 }, 'params');
      const res = mockResponse();
      const middleware = validate('params', testSchema, { merge: true });

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.params).toEqual({ name: 'John', age: 25 });
    });

    it('should handle validation errors with details', () => {
      const req = mockRequest({ name: '', age: -1 });
      const res = mockResponse();
      const middleware = validate('body', testSchema);

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Request validation failed',
        details: expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('age'),
        ]),
        timestamp: expect.any(String),
        path: undefined,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle non-Zod errors', () => {
      const req = mockRequest({ name: 'John', age: 25 });
      const res = mockResponse();
      const faultySchema = {
        parse: () => {
          throw new Error('Non-Zod error');
        },
      } as any;
      const middleware = validate('body', faultySchema);

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid request body',
        message: 'Validation error occurred',
        timestamp: expect.any(String),
        path: undefined,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('backward compatibility functions', () => {
    const testSchema = z.object({
      name: z.string().min(1),
    });

    it('should validate body using validateBody', () => {
      const req = mockRequest({ name: 'John' });
      const res = mockResponse();
      const middleware = validateBody(testSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'John' });
    });

    it('should validate params using validateParams', () => {
      const req = mockRequest({ name: 'John' }, 'params');
      const res = mockResponse();
      const middleware = validateParams(testSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.params).toEqual({ name: 'John' });
    });

    it('should validate query using validateQuery', () => {
      const req = mockRequest({ name: 'John' }, 'query');
      const res = mockResponse();
      const middleware = validateQuery(testSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.query).toEqual({ name: 'John' });
    });
  });

  describe('validateRequest (combined validation)', () => {
    const bodySchema = z.object({
      name: z.string().min(1),
    });

    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    it('should validate both body and params successfully', () => {
      const req = {
        body: { name: 'John' },
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      } as unknown as Request;
      const res = mockResponse();
      const middleware = validateRequest(bodySchema, paramsSchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'John' });
      expect(req.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
    });

    it('should validate only body when no params schema provided', () => {
      const req = {
        body: { name: 'John' },
        params: { id: 'invalid-uuid' },
      } as unknown as Request;
      const res = mockResponse();
      const middleware = validateRequest(bodySchema);

      middleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'John' });
      // params should remain unchanged when no params schema provided
      expect(req.params).toEqual({ id: 'invalid-uuid' });
    });

    it('should handle body validation errors', () => {
      const req = {
        body: { name: '' },
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      } as unknown as Request;
      const res = mockResponse();
      const middleware = validateRequest(bodySchema, paramsSchema);

      middleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        message: 'Request validation failed',
        details: expect.arrayContaining([expect.stringContaining('name')]),
        timestamp: expect.any(String),
        path: undefined,
      });
    });
  });
});
