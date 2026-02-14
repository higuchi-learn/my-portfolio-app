"use client";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Header from "@/components/layouts/header";
import PostCard from "@/components/features/posts";
import Grid from "@/components/grid";

export default function BooksPage() {
  return (
    <div className="min-h-screen p-6">
      <Header />

      <main className="mt-12">
        <Heading tag="h1">Books</Heading>
        <Text>
          技術書の感想やレビューを記録するページです.
        </Text>

        <Grid columns={2} gap="sm" className="posts-card-grid">
          <PostCard/>
          <PostCard/>
          <PostCard/>
          <PostCard/>
        </Grid>
      </main>
    </div>
  );
}
