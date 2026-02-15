import Heading from "@/components/heading";
import Text from "@/components/text";
import Card from "@/components/card";
import Sticker from "@/components/sticker";
import Image from "@/components/image";
import Container from "@/components/container";
import Column from "@/components/column";
import Row from "@/components/row";

export default function PostCard() {
  return (
    <Card scaleFactor="body"
            className="w-full posts-card-item"
              variant="outline"
              material="glass"
              lk-material="glass"
              isClickable
              onClick={() => alert("Card clicked!")}
            >
      <Container className="relative">
        <Column className="pr-4xl">
          <Heading tag="h3" fontClass="title2-bold">title</Heading>
          <Text className="mt-2">description</Text>
          <Row>
            <Sticker bgColor="secondary">旅行</Sticker>
          </Row>
          <Text className="mt-2 text-sm text-gray-500">投稿日 : 2024-06-01</Text>
        </Column>
          <Image
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&h=900&q=80"
            alt="Laptop on desk"
            aspect="16/9"
            objectFit="cover"
            borderRadius="sm"
            width="4xl"
            height="auto"
            className="absolute right-0 top-1/2 -translate-y-1/2"
          />
      </Container>
    </Card>
  );
}
