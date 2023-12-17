import type { IncomingMessage, ServerResponse } from "node:http";
import type { Logger } from "./core/Logger";
import type { MatchFunction } from "path-to-regexp";
import type { serialize } from "cookie";
import type { ZodSchema, ZodTypeDef } from "zod";

export type QueryType = Record<string, unknown>;
export type ParamsType = Record<string, unknown>;

export interface State {
  [key: string]: unknown;
}

export interface RawContext extends ServerResponse {
  req: IncomingMessage;
}

export interface Context extends RawContext {
  log: Logger;
  url: URL;
  body: unknown;
  state: State;
  query: QueryType;
  cookies: Record<string, string>;
  setCookie: (...args: Parameters<typeof serialize>) => void;
}

export interface Middleware {
  (ctx: Context, next: () => Promise<void>): unknown;
}

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export interface Schema<Body, Query, Params> {
  body?: ZodSchema<Body, ZodTypeDef, any>;
  query?: ZodSchema<Query, ZodTypeDef, any>;
  params?: ZodSchema<Params, ZodTypeDef, any>;
}

export interface RouteContext<
  Body,
  Query extends QueryType,
  Params extends ParamsType
> extends Context {
  body: Body;
  query: Query;
  params: Params;
}

export interface RouteHandler<
  Body,
  Query extends QueryType,
  Params extends ParamsType
> {
  (ctx: RouteContext<Body, Query, Params>): unknown;
}

export interface Route<
  Body,
  Query extends QueryType,
  Params extends ParamsType
> {
  method: Method;
  path: string;
  schema: Schema<Body, Query, Params>;
  handler: RouteHandler<Body, Query, Params>;
}

export interface InnerRoute<
  Body = unknown,
  Query extends QueryType = QueryType,
  Params extends ParamsType = ParamsType
> extends Route<Body, Query, Params> {
  match: MatchFunction;
}
