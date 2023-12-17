```typescript
import { App, Router } from "coco";
import { z } from "zod";

const app = new App();

const router = new Router();
router.get(
  "/test/:id",
  {
    query: z.object({ test: z.optional(z.string()) }),
    params: z.object({ id: z.coerce.number() }),
  },
  (ctx) => ({ hello: `hello ${ctx.params.id} ${ctx.query.test}` })
);

app.use(router.middleware());
app.listen(8080);
app.log.info("Server starting at http://localhost:8080");
```
