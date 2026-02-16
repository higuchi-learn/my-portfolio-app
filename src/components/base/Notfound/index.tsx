import Header from "@/components/base/Header";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Container from "@/components/LiftKit/container";

export default function NotFound() {
  return (
    <Container className="min-h-screen p-6">
      <Header />
        <Heading tag="h1">404 Not Found.</Heading>
        <Text>指定された投稿は存在しないか、公開されていません。</Text>
    </Container>
  );
}
