import { RawContext } from "../types";

export async function parseBody(ctx: RawContext): Promise<unknown> {
  const buf = await new Promise<Buffer>((resolve, reject) => {
    let body: Buffer[] = [];
    ctx.req
      .on("data", (chunk: Buffer) => {
        body.push(chunk);
      })
      .on("error", (err) => {
        reject(err);
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
