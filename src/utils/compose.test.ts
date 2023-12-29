import { test, expect } from "vitest";

import { sleep } from "@w72/lodash";

import { compose } from "./compose";
import type { Context, Middleware } from "../types";

test("should work", async () => {
  const middleware1: Middleware = async (_, next) => {
    await sleep(1);
    await next();
  };

  const middleware2: Middleware = async (ctx, next) => {
    ctx.body = "body";
    await sleep(1);
    await next();
    await sleep(1);
  };

  const middleware3: Middleware = async () => {
    await sleep(1);
    return "ret";
  };

  const ctx = {} as Context;
  const res = await compose([middleware1, middleware2, middleware3])(ctx);
  expect(res).toBe("ret");
  expect(ctx.body).toBe("body");
});
