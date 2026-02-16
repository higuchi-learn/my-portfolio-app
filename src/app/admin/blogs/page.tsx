"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/Header";
import PostCard from "@/components/layouts/PostCard";
import Grid from "@/components/LiftKit/grid";

interface PostItem {
	id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail: string | null;
	tags: string | null;
	status: "draft" | "published" | "archived";
	createdAt: string;
}

export default function BlogPage() {
	const router = useRouter();
	const [blogs, setBlogs] = useState<PostItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchBlogs = async () => {
			try {
				const response = await fetch("/api/admin/blogs", { cache: "no-store" });

				if (!response.ok) {
					throw new Error("投稿の取得に失敗しました。");
				}

				const data = (await response.json()) as PostItem[];
				setBlogs(data);
			} catch (error) {
				console.error(error);
				setErrorMessage("投稿一覧の読み込みに失敗しました。");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchBlogs();
	}, []);

	const parseTags = (tags: string | null) => {
		if (!tags) {
			return [];
		}

		return tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
	};

	return (
		<div className="min-h-screen p-6">
			<Header />

			<main className="mt-12">
				<Heading tag="h1">Admin Blog</Heading>
				<Text>
					管理用の記事一覧ページです.
				</Text>

				{isLoading && <Text>投稿を読み込み中です...</Text>}

				{!isLoading && errorMessage && <Text>{errorMessage}</Text>}

				{!isLoading && !errorMessage && blogs.length === 0 && (
					<Text>投稿はまだありません。</Text>
				)}

				{!isLoading && !errorMessage && blogs.length > 0 && (
					<Grid columns={2} gap="sm" className="blog-card-grid">
						{blogs.map((blog) => (
							<PostCard
								key={blog.id}
								clickable
								onClick={() => router.push(`/admin/blogs/${blog.slug}`)}
								title={blog.title}
								description={blog.description}
								thumbnail={blog.thumbnail ?? undefined}
								tags={parseTags(blog.tags)}
								status={blog.status}
								publishedDate={blog.createdAt.slice(0, 10)}
							/>
						))}
					</Grid>
				)}
			</main>
		</div>
	);
}
