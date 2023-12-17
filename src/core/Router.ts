import { match } from "path-to-regexp";

import {
  Middleware,
  InnerRoute,
  Method,
  Schema,
  RouteHandler,
  QueryType,
  ParamsType,
} from "../types";

export class Router {
  routes: InnerRoute[] = [];

  static concat(routers: Router[]) {
    const ret = new Router();
    ret.routes = routers.flatMap((v) => v.routes);
    return ret;
  }

  #add<Body, Query extends QueryType, Params extends ParamsType>(
    method: Method,
    path: string,
    schema: Schema<Body, Query, Params>,
    handler: RouteHandler<Body, Query, Params>
  ) {
    this.routes.push({
      path,
      method,
      schema,
      handler,
      match: match(path),
    } as InnerRoute);
  }

  get<Body, Query extends QueryType, Params extends ParamsType>(
    path: string,
    schema: Schema<Body, Query, Params>,
    handler: RouteHandler<Body, Query, Params>
  ) {
    this.#add("GET", path, schema, handler);
  }

  post<Body, Query extends QueryType, Params extends ParamsType>(
    path: string,
    schema: Schema<Body, Query, Params>,
    handler: RouteHandler<Body, Query, Params>
  ) {
    this.#add("POST", path, schema, handler);
  }

  put<Body, Query extends QueryType, Params extends ParamsType>(
    path: string,
    schema: Schema<Body, Query, Params>,
    handler: RouteHandler<Body, Query, Params>
  ) {
    this.#add("PUT", path, schema, handler);
  }

  delete<Body, Query extends QueryType, Params extends ParamsType>(
    path: string,
    schema: Schema<Body, Query, Params>,
    handler: RouteHandler<Body, Query, Params>
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
          params: matchResult.params as ParamsType,
        });

        if (route.schema.body)
          routeCtx.body = route.schema.body.parse(routeCtx.body);

        if (route.schema.query)
          routeCtx.query = route.schema.query.parse(routeCtx.query);

        if (route.schema.params)
          routeCtx.params = route.schema.params.parse(routeCtx.params);

        return route.handler(routeCtx);
      }
    };
  }
}
