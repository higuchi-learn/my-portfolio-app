"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/Header";
import PostCard from "@/components/layouts/PostCard";
import Grid from "@/components/LiftKit/grid";

interface BookItem {
	id: string;
	slug: string;
	title: string;
	author: string;
	description: string;
	thumbnail: string | null;
	tags: string | null;
	status: "draft" | "published" | "archived";
	createdAt: string;
}

export default function BookPage() {
	const router = useRouter();
	const [books, setBooks] = useState<BookItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const response = await fetch("/api/admin/books", { cache: "no-store" });

				if (!response.ok) {
					throw new Error("書籍の取得に失敗しました。");
				}

				const data = (await response.json()) as BookItem[];
				setBooks(data);
			} catch (error) {
				console.error(error);
				setErrorMessage("書籍一覧の読み込みに失敗しました。");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchBooks();
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
				<Heading tag="h1">Admin Books</Heading>
				<Text>
					管理用の書籍一覧ページです.
				</Text>

				{isLoading && <Text>書籍を読み込み中です...</Text>}

				{!isLoading && errorMessage && <Text>{errorMessage}</Text>}

				{!isLoading && !errorMessage && books.length === 0 && (
					<Text>書籍はまだありません。</Text>
				)}

				{!isLoading && !errorMessage && books.length > 0 && (
					<Grid columns={2} gap="sm" className="blog-card-grid">
						{books.map((book) => (
							<PostCard
								key={book.id}
								clickable
								onClick={() => router.push(`/admin/books/${book.slug}`)}
								title={book.title}
								description={book.description}
								thumbnail={book.thumbnail ?? undefined}
								tags={parseTags(book.tags)}
								status={book.status}
								publishedDate={book.createdAt.slice(0, 10)}
							/>
						))}
					</Grid>
				)}
			</main>
		</div>
	);
}
