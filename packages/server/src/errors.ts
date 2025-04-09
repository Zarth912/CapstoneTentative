/* eslint-disable @typescript-eslint/no-explicit-any */
interface HttpContext {
  url: string;
  method: string;
  statusCode: number;
  query: any;
  payload: any;
}

export class MoleculerError extends Error {
  public readonly code: number;
  public readonly httpContext: HttpContext;
  constructor(message: string, code: number, httpContext: HttpContext) {
    super(message);
    this.name = 'MoleculerError';
    this.code = code;
    this.httpContext = httpContext;
  }
}

export class ValidationError extends MoleculerError {
  constructor(message: string, httpContext: HttpContext) {
    super(message, 422, httpContext);
    this.name = 'ValidationError';
  }
}

export class ServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
  }
}
