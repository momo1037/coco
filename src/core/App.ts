import http from "node:http";

import { Logger } from "./Logger";
import { initContext } from "../utils/initContext";
import { compose } from "../utils/compose";

import type { Middleware, RawContext } from "../types";

export class App {
  log = new Logger();
  server = http.createServer(this.listener.bind(this));
  listen = this.server.listen.bind(this.server);
  middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  async listener(_: unknown, rep: RawContext) {
    let res: unknown;

    try {
      const ctx = await initContext(rep);
      res = await compose(this.middleware)(ctx);
    } catch (error) {
      rep.statusCode = 500;
      rep.setHeader("Content-Type", "application/json");
      rep.end(JSON.stringify({ code: 500, error }));
      return;
    }

    if (res?.constructor === Object) {
      rep.setHeader("Content-Type", "application/json");
      rep.end(JSON.stringify(res));
      return;
    }

    rep.end(res);
  }
}
