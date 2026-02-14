import Card from "@/components/card";
import Heading from "@/components/heading";
import Text from "@/components/text";

export default function PostCard() {
  return (
    <Card>
      <Heading tag="h2">My First Blog Post</Heading>
      <Text className="mt-2">
        これは私の最初のブログ投稿です。Next.jsとTypeScriptを使って、ポートフォリオサイトを作成しています。
      </Text>
    </Card>
  );
}
