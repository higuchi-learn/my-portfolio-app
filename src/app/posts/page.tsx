"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/header";
import PostCard from "@/components/layouts/postCard";
import Grid from "@/components/LiftKit/grid";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  tags: string | null;
  createdAt: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("投稿の取得に失敗しました。");
        }

        const data = (await response.json()) as PostItem[];
        setPosts(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("投稿一覧の読み込みに失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPosts();
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
        <Heading tag="h1">Blog</Heading>
        <Text>
          日常の出来事を日記として記録するページです.
        </Text>

        {isLoading && <Text>投稿を読み込み中です...</Text>}

        {!isLoading && errorMessage && <Text>{errorMessage}</Text>}

        {!isLoading && !errorMessage && posts.length === 0 && (
          <Text>公開中の投稿はまだありません。</Text>
        )}

        {!isLoading && !errorMessage && posts.length > 0 && (
          <Grid columns={2} gap="sm" className="posts-card-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                clickable
                onClick={() => router.push(`/posts/${post.slug}`)}
                title={post.title}
                description={post.description}
                thumbnail={post.thumbnail ?? undefined}
                tags={parseTags(post.tags)}
                publishedDate={post.createdAt.slice(0, 10)}
              />
            ))}
          </Grid>
        )}
      </main>
    </div>
  );
}
