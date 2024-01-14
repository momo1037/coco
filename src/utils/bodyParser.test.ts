import { it, expect } from "vitest";
import { PassThrough } from "node:stream";
import { bodyParser } from "./bodyParser";
import { RawContext } from "../types";

it("should return buffer when no headers", async () => {
  const stream = new PassThrough();

  const ctx = {
    req: Object.assign(stream, { headers: {} }),
  } as unknown as RawContext;

  const promise = bodyParser(ctx);

  stream.emit("data", Buffer.from("hello"));
  stream.end();
  stream.destroy();

  const res = await promise;
  expect((res as Buffer).toString()).toBe("hello");
});

it("should reject buffer when error", async () => {
  const stream = new PassThrough();

  const ctx = {
    req: Object.assign(stream, { headers: {} }),
  } as unknown as RawContext;

  const promise = bodyParser(ctx);

  stream.emit("data", Buffer.from("hello"));
  stream.emit("error", "no data");
  stream.end();
  stream.destroy();

  try {
    await promise;
  } catch (e) {
    expect(e).toBe("no data");
  }
});

it("should reject buffer when content type json", async () => {
  const stream = new PassThrough();

  const ctx = {
    req: Object.assign(stream, {
      headers: { "content-type": "application/json" },
    }),
  } as unknown as RawContext;

  const promise = bodyParser(ctx);

  stream.emit("data", Buffer.from('{"hello": "world"}'));
  stream.end();
  stream.destroy();

  const res = await promise;
  expect(res).toStrictEqual({ hello: "world" });
});
