import { Hono } from "hono";
import { respond } from "@/api/lib/utils/respond";

const example = new Hono().get("/", async (ctx) => {
  const query = ctx.req.query();
  const name = query.name;

  if (!name) {
    return respond.err(ctx, "Name is required", 400);
  }

  return respond.ok(
    ctx,
    {
      name,
    },
    "Successfully fetched data",
    200,
  );
});

export default example;
export type ExampleType = typeof example;
