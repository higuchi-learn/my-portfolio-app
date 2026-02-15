import { app } from "@/server/app";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// honoをNext.jsのAPIルートとしてエクスポート
const handler = async (req: Request) => {
	const { env, ctx } = await getCloudflareContext({ async: true });
	return app.fetch(req, env, ctx);
};

export const GET = handler;
export const POST = handler;
