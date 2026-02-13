import { handle } from "hono/vercel";
import { app } from "@/server/app";

// honoをNext.jsのAPIルートとしてエクスポート
export const GET = handle(app);
export const POST = handle(app);
