import { vi, it, expect } from "vitest";
import { initContext } from "./initContext";
import { RawContext } from "../types";

vi.mock("./bodyParser.ts", () => ({
  bodyParser: () => null,
}));

it("should work", async () => {
  const resHeaders: Record<string, string> = {};
  const rawContext = {
    req: { headers: {} },
    setHeader(k: string, v: string) {
      resHeaders[k] = v;
    },
    getHeader(k: string) {
      return resHeaders[k];
    },
  } as RawContext;

  const ctx = await initContext(rawContext);
  expect(ctx).toBeDefined();

  ctx.setCookie("name", "value");
  expect(ctx.getHeader("Set-Cookie")).toBe("name=value");
});
