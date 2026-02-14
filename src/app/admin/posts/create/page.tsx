"use client";

import { type ClipboardEvent, useMemo, useState } from "react";
import { marked } from "marked";
import Container from "@/components/container";
import Column from "@/components/column";
import Section from "@/components/section";
import Grid from "@/components/grid";
import Heading from "@/components/heading";
import TextInput from "@/components/text-input";
import Button from "@/components/button";
import Row from "@/components/row";

export default function Page() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState("");
	const [content, setContent] = useState("");

	const readFileAsDataUrl = (file: File) =>
		new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result ?? ""));
			reader.onerror = () => reject(new Error("Failed to read pasted image"));
			reader.readAsDataURL(file);
		});

	const handleContentPaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const imageItems = Array.from(event.clipboardData.items).filter(
			(item) => item.kind === "file" && item.type.startsWith("image/"),
		);

		if (imageItems.length === 0) {
			return;
		}

		event.preventDefault();
		const textarea = event.currentTarget;
		const selectionStart = textarea.selectionStart;
		const selectionEnd = textarea.selectionEnd;

		const markdownImages: string[] = [];

		for (const item of imageItems) {
			const file = item.getAsFile();
			if (!file) {
				continue;
			}

			const imageDataUrl = await readFileAsDataUrl(file);
			if (!imageDataUrl) {
				continue;
			}

			const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "pasted-image";
			markdownImages.push(`![${baseName}](${imageDataUrl})`);
		}

		if (markdownImages.length === 0) {
			return;
		}

		let nextCursorPosition = selectionStart;

		setContent((prev) => {
			const before = prev.slice(0, selectionStart);
			const after = prev.slice(selectionEnd);
			const needsLeadingNewline = before.length > 0 && !before.endsWith("\n");
			const prefix = needsLeadingNewline ? "\n" : "";
			const inserted = `${prefix}${markdownImages.join("\n\n")}\n`;
			nextCursorPosition = before.length + inserted.length;
			return `${before}${inserted}${after}`;
		});

		requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
		});
	};

	const html = useMemo(() => {
		return marked.parse(content || "", {
			gfm: true,
			breaks: true,
		}) as string;
	}, [content]);

	return (
		<Container className="admin-editor-page admin-full-width">
      <Section>
        <Row>
          <Heading tag="h1" fontClass="title1">Blog新規作成</Heading>
          <Button label="仮保存" variant="outline" color="primary" />
          <Button label="公開" variant="fill" color="primary" />
        </Row>
      </Section>
			<Grid columns={2} gap="md" className="admin-editor-grid">
				<Section className="admin-editor-pane">
					<Container className="admin-editor-form-shell">
            <Column gap="md" className="admin-editor-form">
							<TextInput
								value={title}
								name="Title"
                endIcon="edit"
								onChange={(event) => setTitle(event.target.value)}
								className="w-full"
								placeholder="記事タイトル"
							/>
              <TextInput
								value={description}
								name="Description"
                endIcon="edit"
								onChange={(event) => setDescription(event.target.value)}
								className="w-full"
								placeholder="概要(記事には表示されません)"
							/>
              <TextInput
								value={tags}
								name="Tags"
                endIcon="edit"
								onChange={(event) => setTags(event.target.value)}
								className="w-full"
								placeholder="検索用タグ（例: react,nextjs）"
							/>

              <label htmlFor="post-content" className="label">
                Content
              </label>
              <textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
								onPaste={handleContentPaste}
                className="admin-editor-textarea"
                placeholder="# 本文をMarkdownで記述"
              />
            </Column>
					</Container>
				</Section>

				<Section className="admin-editor-pane">
					<article className="space-y-4 admin-editor-preview-pane">
						<h1 className="text-3xl font-bold">{title || "PreView"}</h1>

						<div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} />
					</article>
				</Section>
			</Grid>
		</Container>
	);
}
