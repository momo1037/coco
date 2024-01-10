import cookie from "cookie";

import { Logger } from "../core/Logger";
import { bodyParser } from "./bodyParser";

import type { RawContext, Context } from "../types";

export async function initContext(rawContext: RawContext): Promise<Context> {
  const { req } = rawContext;

  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const log = new Logger();
  const body = await bodyParser(rawContext);
  const state = {};
  const query = Object.fromEntries(url.searchParams);
  const cookies = cookie.parse(req.headers.cookie ?? "");
  const setCookie = (...args: Parameters<typeof cookie.serialize>) => {
    rawContext.setHeader("Set-Cookie", cookie.serialize(...args));
  };

  return Object.assign(rawContext, {
    url,
    log,
    body,
    state,
    query,
    cookies,
    setCookie,
  });
}
