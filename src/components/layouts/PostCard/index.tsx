import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Card from "@/components/LiftKit/card";
import Sticker from "@/components/LiftKit/sticker";
import Image from "@/components/LiftKit/image";
import Container from "@/components/LiftKit/container";
import Column from "@/components/LiftKit/column";
import Row from "@/components/LiftKit/row";

interface PostCardProps {
  clickable?: boolean;
  title?: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  publishedDate?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function PostCard({
  clickable = true,
  title = "title",
  description = "description",
  thumbnail,
  tags = ["旅行"],
  publishedDate,
  onClick,
}: PostCardProps) {
  const thumbnailSrc =
    thumbnail?.trim() ||
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&h=900&q=80";

  const displayDate = publishedDate ?? new Date().toISOString().slice(0, 10);

  return (
    <Card scaleFactor="body"
            className="w-full blog-card-item"
              variant="outline"
              material="glass"
              lk-material="glass"
              isClickable={clickable}
              onClick={clickable ? onClick : undefined}
            >
      <Container className="relative">
        <Column className="pr-4xl">
          <Heading tag="h3" fontClass="title2-bold">{title}</Heading>
          <Text className="mt-2">{description}</Text>
          <Row gap="xs">
            {tags.map((tag) => (
              <Sticker key={tag} bgColor="secondary">{tag}</Sticker>
            ))}
          </Row>
          <Text className="mt-2 text-sm text-gray-500">投稿日 : {displayDate}</Text>
        </Column>
          <Image
            src={thumbnailSrc}
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
