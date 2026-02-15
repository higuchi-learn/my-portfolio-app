import { drizzle } from "drizzle-orm/d1";

// D1のバインディング型定義
export type AppBindings = {
  my_portfolio_app: D1Database;
  R2: R2Bucket;
};

// コンテキストの型定義
export type AppVariables = {
  db: ReturnType<typeof drizzle>;
};

// Bindings => 環境変数の型定義(c.env)
// Variables => コンテキストの型定義(c.get, c.set)
export type AppEnv = {
  Bindings: AppBindings;
  Variables: AppVariables;
};
