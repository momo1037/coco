import { Context, Middleware, RawContext } from "../types";
import http, { type IncomingMessage } from "node:http";
import { Logger } from "./Logger";
import cookie from "cookie";
import { parseBody } from "../utils/parseBody";

export class App {
  log = new Logger();
  server = http.createServer(this.listener.bind(this));
  listen = this.server.listen.bind(this.server);
  middleware: Middleware[] = [];

  use(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  async compose(ctx: Context): Promise<unknown> {
    let ret: unknown;
    const dispatch = async (i: number) => {
      const fn = this.middleware[i];
      const res = await fn(ctx, dispatch.bind(this, i + 1));
      if (i === this.middleware.length - 1) ret = res;
    };
    await dispatch(0);
    return ret;
  }

  async listener(req: IncomingMessage, rep: RawContext) {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const log = new Logger();
    const body = await parseBody(rep);
    const query = Object.fromEntries(url.searchParams);
    const headers = req.headers;
    const cookies = cookie.parse(req.headers.cookie ?? "");
    const setCookie = (...args: Parameters<typeof cookie.serialize>) => {
      rep.setHeader("Set-Cookie", cookie.serialize(...args));
    };

    const ctx: Context = Object.assign(rep, {
      url,
      log,
      body,
      query,
      headers,
      cookies,
      setCookie,
    });

    let res: unknown;

    try {
      res = await this.compose(ctx);
    } catch (error) {
      rep.statusCode = 500;
      rep.setHeader("Content-Type", "application/json");
      rep.end(JSON.stringify({ code: 500, error }));
      return;
    }

    if (res && typeof res === "object") {
      rep.setHeader("Content-Type", "application/json");
      rep.end(JSON.stringify(res));
      return;
    }

    if (!rep.getHeader("Content-Type")) {
      rep.setHeader("Content-Type", "text/plain");
    }

    rep.end(res);
  }
}
