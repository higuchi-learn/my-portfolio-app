"use client";
import Heading from "@/components/heading";
import Text from "@/components/text";
import Header from "@/components/layouts/header";

export default function Home() {
	return (
		<div className="min-h-screen p-6">
			<Header />

			<main className="mt-12">
				<Heading tag="h1">Welcome to My Portfolio</Heading>
				<Text className="mt-4">
					ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
				</Text>

			</main>
		</div>
	);
}
