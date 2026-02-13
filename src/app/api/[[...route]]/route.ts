import { Hono } from "hono";
import { handle } from "hono/vercel";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema/index";

type Bindings = {
  my_portfolio_app: D1Database;
};

type Variables = {
  db: ReturnType<typeof drizzle>;
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.use("*", async (c, next) => {
  const db = drizzle(c.env.my_portfolio_app, { schema });
  c.set("db", db);
  await next();
});

app.get("/", (c) => c.json({ ok: true }));

export const GET = handle(app);
export const POST = handle(app);
