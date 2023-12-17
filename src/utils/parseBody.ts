import { RawContext } from "../types";

export async function parseBody(ctx: RawContext): Promise<unknown> {
  const buf = await new Promise<Buffer>((resolve) => {
    let body: Buffer[] = [];
    ctx.req
      .on("data", (chunk: Buffer) => {
        body.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(body));
      });
  });

  if (ctx.req.headers["content-type"] === "application/json") {
    return JSON.parse(buf.toString());
  }

  if (ctx.req.headers["content-type"] === "text/plain") {
    return buf.toString();
  }

  return buf;
}
