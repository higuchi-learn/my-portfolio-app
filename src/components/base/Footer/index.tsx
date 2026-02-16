import Text from "@/components/LiftKit/text";
import Container from "@/components/LiftKit/container";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Container className="text-align-center mt-xl mx-2xl">
      <Text fontClass="body-bold" className="border-b-2">
        Wada Wataru © {year} Copyright.
      </Text>
    </Container>
  );
}
