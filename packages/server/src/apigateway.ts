/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoleculerError, ServerError, ValidationError } from './errors';

type RequestOptions = {
  method?: string;
  params?: Record<string, string>;
  body?: Record<string, string>;
  headers?: Record<string, string>;
};

type ApigatewayClientProps = {
  baseURL: string;
  headers?: Record<string, string>;
};

export class ApigatewayClient {
  public readonly baseURL: URL;
  public readonly headers: Record<string, string>;
  constructor(props: ApigatewayClientProps) {
    this.baseURL = new URL(props.baseURL);
    this.headers = {
      'Content-Type': 'application/json',
      ...props.headers,
    };
  }
  urlFor(path: string, params?: Record<string, any>) {
    const url = new URL(this.baseURL.toString());
    url.pathname = this.baseURL.pathname + path;
    if (params) {
      const filteredParams = Object.entries(params).reduce(
        (obj, [key, value]) =>
          value === undefined ? obj : { ...obj, [key]: value },
        {},
      );
      url.search = new URLSearchParams(filteredParams).toString();
    }
    return url;
  }
  async fetch(path: string, req?: RequestOptions) {
    const { method = 'GET', body, headers, params } = req || {};
    const url = this.urlFor(path, params);
    const res = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: {
        ...this.headers,
        ...headers,
      },
    });
    let data: string | object;
    data = await res.text();
    try {
      data = JSON.parse(data);
    } catch (error) {
      // console.log(error);
    }
    if (res.ok) {
      return data;
    }
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      const httpContext = {
        url: url.toString(),
        method,
        statusCode: res.status,
        query: params,
        payload: body,
      };
      if ('name' in data && data.name === 'ValidationError') {
        throw new ValidationError(data.message, httpContext);
      }
      if ('code' in data && typeof data.code === 'number') {
        throw new MoleculerError(data.message, data.code, httpContext);
      }
      throw new ServerError(data.message);
    }
    throw new ServerError('Internal server error');
  }
  async get<T = any>(path: string, params?: Record<string, any>) {
    const res = await this.fetch(path, { params });
    return res as T;
  }
  async post<T = any>(path: string, payload: Record<string, any>) {
    const res = await this.fetch(path, {
      method: 'POST',
      body: payload,
    });
    return res as T;
  }
  async put<T = any>(path: string, payload: Record<string, any>) {
    const res = await this.fetch(path, {
      method: 'PUT',
      body: payload,
    });
    return res as T;
  }
  async delete<T = any>(path: string, params?: Record<string, any>) {
    const res = await this.fetch(path, {
      method: 'DELETE',
      params,
    });
    return res as T;
  }
}
