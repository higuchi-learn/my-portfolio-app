import Header from "@/components/base/header";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";

export default function NotFound() {
  return (
    <div className="min-h-screen p-6">
      <Header />
      <main className="mt-12">
        <Heading tag="h1">Not Found</Heading>
        <Text>指定された投稿は存在しないか、公開されていません。</Text>
      </main>
    </div>
  );
}
