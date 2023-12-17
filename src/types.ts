import type { IncomingMessage, ServerResponse } from "node:http";
import type { Logger } from "./core/Logger";
import type { MatchFunction } from "path-to-regexp";
import type { serialize } from "cookie";
import { ZodSchema, ZodTypeDef } from "zod";

export interface RawContext extends ServerResponse {
  req: IncomingMessage;
}

export interface Context<
  Body = unknown,
  Query = Record<string, unknown>,
  Headers = Record<string, unknown>,
  Cookies = Record<string, string>
> extends RawContext {
  log: Logger;
  url: URL;
  body: Body;
  query: Query;
  headers: Headers;
  cookies: Cookies;
  setCookie: (...args: Parameters<typeof serialize>) => void;
}

export type Middleware = (ctx: Context, next: () => Promise<void>) => unknown;

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Schema<Body, Query, Params, Headers, Cookies> {
  body?: ZodSchema<Body, ZodTypeDef, any>;
  query?: ZodSchema<Query, ZodTypeDef, any>;
  params?: ZodSchema<Params, ZodTypeDef, any>;
  headers?: ZodSchema<Headers, ZodTypeDef, any>;
  cookies?: ZodSchema<Cookies, ZodTypeDef, any>;
}

export interface RouteContext<Body, Query, Params, Headers, Cookies>
  extends Context<Body, Query, Headers, Cookies> {
  params: Params;
}

export interface RouteHandler<Body, Query, Params, Headers, Cookies> {
  (ctx: RouteContext<Body, Query, Params, Headers, Cookies>): unknown;
}

export interface Route<Body, Query, Params, Headers, Cookies> {
  method: Method;
  path: string;
  schema: Schema<Body, Query, Params, Headers, Cookies>;
  handler: RouteHandler<Body, Query, Params, Headers, Cookies>;
}

export interface InnerRoute<
  Body = unknown,
  Query = Record<string, unknown>,
  Params = Record<string, unknown>,
  Headers = Record<string, unknown>,
  Cookies = Record<string, string>
> extends Route<Body, Query, Params, Headers, Cookies> {
  match: MatchFunction;
}
