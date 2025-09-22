// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const body = exception.getResponse();

    const payload =
      typeof body === 'string'
        ? { code: 'HTTP_ERROR', message: body }
        : (body as Record<string, unknown>);

    res.status(status).json({
      ok: false,
      status,
      ...payload,
    });
  }
}
