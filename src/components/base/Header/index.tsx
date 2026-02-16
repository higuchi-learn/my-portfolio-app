import Link from "next/link";
import Button from "@/components/LiftKit/button";
import NavBar from "@/components/LiftKit/navbar";
import Container from "@/components/LiftKit/container";
import IconButton from "@/components/LiftKit/icon-button";

export default function Header() {
  return (
    <Container className="border-b-2 border-gray-200 py-xs mb-md">
      <NavBar
        navButtons={[
          <Link key="blog" href="/blogs">
            <Button label="Blog" variant="text" />
          </Link>,
          <Link key="works" href="/works">
            <Button label="Works" variant="text" />
          </Link>,
          <Link key="books" href="/books">
            <Button label="Books" variant="text" />
          </Link>,
        ]}
        navDropdowns={[]}
        iconButtons={[
          <IconButton key="github" icon="github" aria-label="GitHub" />,
          <IconButton key="twitter" icon="twitter" aria-label="Twitter" />,
        ]}
        ctaButtons={[
          <Link key="contact" href="/contact">
            <Button label="Contact" variant="fill" />
          </Link>,
        ]}
        className="p-0"
      />
    </Container>
  );
}
