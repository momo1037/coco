import { match } from "path-to-regexp";
import { Middleware, InnerRoute, Method, Schema, RouteHandler } from "../types";

export class Router {
  routes: InnerRoute[] = [];

  static concat(routers: Router[]) {
    const ret = new Router();
    ret.routes = routers.flatMap((v) => v.routes);
    return ret;
  }

  #add<Body, Query, Params, Headers, Cookies>(
    method: Method,
    path: string,
    schema: Schema<Body, Query, Params, Headers, Cookies>,
    handler: RouteHandler<Body, Query, Params, Headers, Cookies>
  ) {
    this.routes.push({
      path,
      method,
      schema,
      handler,
      match: match(path),
    } as unknown as InnerRoute);
  }

  get<Body, Query, Params, Headers, Cookies>(
    path: string,
    schema: Schema<Body, Query, Params, Headers, Cookies>,
    handler: RouteHandler<Body, Query, Params, Headers, Cookies>
  ) {
    this.#add("GET", path, schema, handler);
  }

  post<Body, Query, Params, Headers, Cookies>(
    path: string,
    schema: Schema<Body, Query, Params, Headers, Cookies>,
    handler: RouteHandler<Body, Query, Params, Headers, Cookies>
  ) {
    this.#add("POST", path, schema, handler);
  }

  put<Body, Query, Params, Headers, Cookies>(
    path: string,
    schema: Schema<Body, Query, Params, Headers, Cookies>,
    handler: RouteHandler<Body, Query, Params, Headers, Cookies>
  ) {
    this.#add("PUT", path, schema, handler);
  }

  delete<Body, Query, Params, Headers, Cookies>(
    path: string,
    schema: Schema<Body, Query, Params, Headers, Cookies>,
    handler: RouteHandler<Body, Query, Params, Headers, Cookies>
  ) {
    this.#add("DELETE", path, schema, handler);
  }

  middleware(): Middleware {
    return (ctx) => {
      for (const route of this.routes) {
        if (route.method !== ctx.req.method) continue;

        const matchResult = route.match(ctx.url.pathname);
        if (!matchResult) continue;

        const routeCtx = Object.assign(ctx, {
          params: matchResult.params as Record<string, unknown>,
        });

        if (route.schema.body)
          routeCtx.body = route.schema.body.parse(routeCtx.body);

        if (route.schema.query)
          routeCtx.query = route.schema.query.parse(routeCtx.query);

        if (route.schema.params)
          routeCtx.params = route.schema.params.parse(routeCtx.params);

        if (route.schema.headers)
          routeCtx.headers = route.schema.headers.parse(routeCtx.headers);

        if (route.schema.cookies)
          routeCtx.cookies = route.schema.cookies.parse(routeCtx.cookies);

        return route.handler(routeCtx);
      }
    };
  }
}
