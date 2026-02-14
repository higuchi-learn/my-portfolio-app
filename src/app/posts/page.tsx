"use client";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Header from "@/components/layouts/header";
import PostCard from "@/components/features/posts";
import Grid from "@/components/grid";

export default function PostsPage() {
  return (
    <div className="min-h-screen p-6">
      <Header />

      <main className="mt-12">
        <Heading tag="h1">Blog</Heading>
        <Text>
          日常の出来事を日記として記録するページです.
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
