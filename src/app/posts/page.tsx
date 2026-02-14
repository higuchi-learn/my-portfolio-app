"use client";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Header from "@/components/layouts/header";
import Grid from "@/components/grid";
import Card from "@/components/card";
import Sticker from "@/components/sticker";
import Image from "@/components/image";

export default function PostsPage() {
  return (
    <div className="min-h-screen p-6">
      <Header />

      <main className="mt-12">
        <Heading tag="h1">Blog</Heading>
        <Text>
          日常の出来事を日記として記録するページです.
        </Text>


        <Grid columns={2} gap="sm">
        <Card scaleFactor="body"
        className="w-full"
          variant="outline"
          material="glass"
          lk-material="glass"
          isClickable
          onClick={() => alert("Card clicked!")}
        >
          <div className="relative text-left">
            <div className="pr-4xl">
              <Heading tag="h3" fontClass="title2-bold">title</Heading>
              <Text className="mt-2">description</Text>
              <Sticker className="mt-4" bgColor="primarycontainer">旅行</Sticker>
              <Text className="mt-2 text-sm text-gray-500">投稿日 : 2024-06-01</Text>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Image
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&h=900&q=80"
                alt="Laptop on desk"
                aspect="16/9"
                objectFit="cover"
                borderRadius="sm"
                width="4xl"
                height="auto"
              />
            </div>
          </div>
        </Card>
        <Card scaleFactor="body"
        className="w-full"
          variant="outline"
          material="glass"
          lk-material="glass"
          isClickable
          onClick={() => alert("Card clicked!")}
        >
          <Heading tag="h3" fontClass="title2-bold">title</Heading>
          <Text className="mt-2">description</Text>
          <Sticker className="mt-4" bgColor="primarycontainer">旅行</Sticker>
          <Text className="mt-2 text-sm text-gray-500">投稿日 : 2024-06-01</Text>
        </Card>
        </Grid>
      </main>
    </div>
  );
}
