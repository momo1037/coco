import { it, expect } from "vitest";

import { sleep } from "@w72/lodash";

import { compose } from "./compose";
import type { Context, Middleware } from "../types";

const middleware1: Middleware = async (ctx, next) => {
  ctx.body = "1";
  await sleep(1);
  await next();
  await sleep(1);
  ctx.body += "5";
};

const middleware2: Middleware = async (ctx, next) => {
  ctx.body += "2";
  await sleep(1);
  await next();
  await sleep(1);
  ctx.body += "4";
};

const middleware3: Middleware = async (ctx) => {
  ctx.body += "3";
  await sleep(1);
  return "ret";
};

it("should work", async () => {
  const ctx = {} as Context;
  const res = await compose([middleware1, middleware2, middleware3])(ctx);
  expect(res).toBe("ret");
  expect(ctx.body).toBe("12345");
});
