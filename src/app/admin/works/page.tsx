"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/Header";
import PostCard from "@/components/layouts/PostCard";
import Grid from "@/components/LiftKit/grid";

interface WorkItem {
	id: string;
	slug: string;
	title: string;
	description: string;
	thumbnail: string | null;
	techStack: string | null;
	status: "draft" | "published" | "archived";
	createdAt: string;
}

export default function WorkPage() {
	const router = useRouter();
	const [works, setWorks] = useState<WorkItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchWorks = async () => {
			try {
				const response = await fetch("/api/admin/works", { cache: "no-store" });

				if (!response.ok) {
					throw new Error("作品の取得に失敗しました。");
				}

				const data = (await response.json()) as WorkItem[];
				setWorks(data);
			} catch (error) {
				console.error(error);
				setErrorMessage("作品一覧の読み込みに失敗しました。");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchWorks();
	}, []);

	const parseTechStack = (techStack: string | null) => {
		if (!techStack) {
			return [];
		}

		return techStack
			.split(",")
			.map((tech) => tech.trim())
			.filter(Boolean);
	};

	return (
		<div className="min-h-screen p-6">
			<Header />

			<main className="mt-12">
				<Heading tag="h1">Admin Works</Heading>
				<Text>
					管理用の作品一覧ページです.
				</Text>

				{isLoading && <Text>作品を読み込み中です...</Text>}

				{!isLoading && errorMessage && <Text>{errorMessage}</Text>}

				{!isLoading && !errorMessage && works.length === 0 && (
					<Text>作品はまだありません。</Text>
				)}

				{!isLoading && !errorMessage && works.length > 0 && (
					<Grid columns={2} gap="sm" className="blog-card-grid">
						{works.map((work) => (
							<PostCard
								key={work.id}
								clickable
								onClick={() => router.push(`/admin/works/${work.slug}`)}
								title={work.title}
								description={work.description}
								thumbnail={work.thumbnail ?? undefined}
								tags={parseTechStack(work.techStack)}
								status={work.status}
								publishedDate={work.createdAt.slice(0, 10)}
							/>
						))}
					</Grid>
				)}
			</main>
		</div>
	);
}
