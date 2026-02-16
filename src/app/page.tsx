"use client";
import Heading from "@/components/LiftKit/heading";
import Text from "@/components/LiftKit/text";
import Header from "@/components/base/Header";
import Container from "@/components/LiftKit/container";
import Footer from "@/components/base/Footer";

export default function Home() {
	return (
		<Container className="min-h-screen p-sm flex flex-col">
			<Header />
			<Container className="flex-1">
				<Heading tag="h1">Welcome to My Portfolio</Heading>
					<Text>
						ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
					</Text>
			</Container>
			<Footer />
		</Container>
	);
}
