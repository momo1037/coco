import { Context, Middleware } from "../types";

export function compose(middleware: Middleware[]) {
  return async (ctx: Context): Promise<unknown> => {
    let ret: unknown;

    const dispatch = async (i: number) => {
      const fn = middleware[i];
      const res = await fn(ctx, dispatch.bind(null, i + 1));
      if (i === middleware.length - 1) ret = res;
    };

    await dispatch(0);

    return ret;
  };
}
