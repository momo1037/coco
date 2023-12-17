import cookie from "cookie";

import { Logger } from "../core/Logger";
import { parseBody } from "./parseBody";

import type { RawContext, Context } from "../types";

export async function parseRawContext(
  rawContext: RawContext
): Promise<Context> {
  const { req } = rawContext;

  const url = new URL(req.url ?? "", `http://${req.headers.host}`);
  const log = new Logger();
  const body = await parseBody(rawContext);
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
