import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Card from "@/components/LiftKit/card";
import Sticker from "@/components/LiftKit/sticker";
import Image from "@/components/LiftKit/image";
import Container from "@/components/LiftKit/container";
import Column from "@/components/LiftKit/column";
import Row from "@/components/LiftKit/row";
import dummyImage from "@/assets/dummy-image.webp";

interface PostCardProps {
  clickable?: boolean;
  title?: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  publishedDate?: string;
  status?: "draft" | "published" | "archived";
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export default function PostCard({
  clickable = true,
  title = "title",
  description = "description",
  thumbnail,
  tags = ["旅行"],
  publishedDate,
  status,
  onClick,
}: PostCardProps) {
  const fallbackThumbnailSrc = typeof dummyImage === "string" ? dummyImage : dummyImage.src;
  const normalizedThumbnail = thumbnail?.trim();
  const thumbnailSrc = normalizedThumbnail && normalizedThumbnail !== "@/assets/dummy-image.webp"
    ? normalizedThumbnail
    : fallbackThumbnailSrc;

  const displayDate = publishedDate ?? new Date().toISOString().slice(0, 10);

  const statusLabelMap = {
    draft: "未公開",
    published: "公開",
    archived: "削除済み",
  } as const;

  const statusColorMap = {
    draft: "warning",
    published: "surface",
    archived: "error",
  } as const;

  const statusLabel = status ? statusLabelMap[status] : undefined;
  const statusColor = status ? statusColorMap[status] : undefined;

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
          <Row gap="md">
            <Text className="mt-2 text-sm text-gray-500">投稿日 : {displayDate}</Text>
            {statusLabel && statusColor ? <Sticker bgColor={statusColor}>{statusLabel}</Sticker> : null}
          </Row>
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
