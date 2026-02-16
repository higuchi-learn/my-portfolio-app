import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Header from "@/components/base/Header";
import Text from "@/components/LiftKit/text";
import mdStyles from "@/app/markdown-preview.module.css";

interface BlogDetail {
	id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail: string | null;
	content: string;
	tags: string | null;
	createdAt: string;
}

const getRequestOrigin = async () => {
	const headerStore = await headers();
	const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

	if (!host) {
		return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
	}

	const protocol =
		headerStore.get("x-forwarded-proto") ??
		(host.includes("localhost") ? "http" : "https");

	return `${protocol}://${host}`;
};

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	try {
		const origin = await getRequestOrigin();
		const response = await fetch(`${origin}/api/blogs/${slug}`, { cache: "no-store" });

		if (response.status === 404) {
			notFound();
		}

		if (!response.ok) {
			throw new Error("投稿の取得に失敗しました。");
		}

		const blog = (await response.json()) as BlogDetail;

		return (
			<div className="min-h-screen p-6">
				<Header />

				<main className="mt-12">
					<article className="space-y-4">
						<h1 className="text-3xl font-bold">{blog.title}</h1>
						<div className={mdStyles.markdownPreview}>
							<ReactMarkdown>{blog.content || ""}</ReactMarkdown>
						</div>
					</article>
				</main>
			</div>
		);
	} catch (error) {
		console.error(error);

		return (
			<div className="min-h-screen p-6">
				<Header />
				<main className="mt-12">
					<Text>投稿の読み込みに失敗しました。</Text>
				</main>
			</div>
		);
	}
}
