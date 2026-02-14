"use client";
import Link from "next/link";
import Button from "@/components/button";
import NavBar from "@/components/navbar";
import IconButton from "@/components/icon-button";

export default function Header() {
  return (
    <NavBar
      navButtons={[
        <Link key="blog" href="/posts">
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
    />
  );
}
