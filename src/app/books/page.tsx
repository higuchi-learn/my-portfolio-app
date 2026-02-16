"use client";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/Header";
import PostCard from "@/components/layouts/PostCard";
import Grid from "@/components/LiftKit/grid";

export default function BooksPage() {
  return (
    <div className="min-h-screen p-6">
      <Header />

      <main className="mt-12">
        <Heading tag="h1">Books</Heading>
        <Text>
          技術書の感想やレビューを記録するページです.
        </Text>

        <Grid columns={2} gap="sm" className="blog-card-grid">
          <PostCard/>
          <PostCard/>
          <PostCard/>
          <PostCard/>
        </Grid>
      </main>
    </div>
  );
}
