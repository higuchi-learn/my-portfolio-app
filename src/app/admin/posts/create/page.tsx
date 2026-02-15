"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type EasyMDE from "easymde";
import ReactMarkdown from "react-markdown";
import Container from "@/components/container";
import Column from "@/components/column";
import Section from "@/components/section";
import Grid from "@/components/grid";
import Heading from "@/components/heading";
import TextInput from "@/components/text-input";
import Button from "@/components/button";
import Text from "@/components/text";
import Row from "@/components/row";
import PostCard from "@/components/features/posts";
import mdStyles from "@/app/markdown-preview.module.css";
import adminEditorMdeStyles from "@/app/admin/admin-editor-mde.module.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function Page() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState("");
	const [tags, setTags] = useState("");
	const [content, setContent] = useState("");
	const [mdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);

	const uploadImageToR2 = useCallback(async (file: File) => {
		const formData = new FormData();
		formData.append("image", file);

		const response = await fetch("/api/admin/posts/upload-image", {
			method: "POST",
			body: formData,
		});

		if (!response.ok) {
			const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
			throw new Error(errorBody?.message ?? "Failed to upload pasted image");
		}

		const data = (await response.json()) as { markdownUrl?: string; url?: string };
		const imageUrl = data.markdownUrl ?? data.url;

		if (!imageUrl) {
			throw new Error("Upload completed but image URL was missing");
		}

		return imageUrl;
	}, []);

	const handleImagePaste = useCallback(async (event: ClipboardEvent) => {
		const imageItems = Array.from(event.clipboardData?.items ?? []).filter(
			(item) => item.kind === "file" && item.type.startsWith("image/"),
		);

		if (imageItems.length === 0 || !mdeInstance) {
			return;
		}

		event.preventDefault();
		const doc = mdeInstance.codemirror.getDoc();
		const selectionStartPos = doc.getCursor("from");
		const selectionEndPos = doc.getCursor("to");
		const editorValue = doc.getValue();
		const selectionStart = doc.indexFromPos(selectionStartPos);
		const selectionEnd = doc.indexFromPos(selectionEndPos);

		const markdownImages: string[] = [];

		try {
			for (const item of imageItems) {
				const file = item.getAsFile();
				if (!file) {
					continue;
				}

				const imageUrl = await uploadImageToR2(file);
				if (!imageUrl) {
					continue;
				}

				const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "pasted-image";
				markdownImages.push(`![${baseName}](${imageUrl})`);
			}
		} catch (error) {
			console.error(error);
			return;
		}

		if (markdownImages.length === 0) {
			return;
		}

		const before = editorValue.slice(0, selectionStart);
		const after = editorValue.slice(selectionEnd);
		const needsLeadingNewline = before.length > 0 && !before.endsWith("\n");
		const prefix = needsLeadingNewline ? "\n" : "";
		const inserted = `${prefix}${markdownImages.join("\n\n")}\n`;
		const nextValue = `${before}${inserted}${after}`;
		const nextCursorPosition = before.length + inserted.length;

		doc.setValue(nextValue);
		doc.setCursor(doc.posFromIndex(nextCursorPosition));
		setContent(nextValue);
	}, [mdeInstance, uploadImageToR2]);

	const handleThumbnailPaste = useCallback(async (event: React.ClipboardEvent<HTMLInputElement>) => {
		const imageItem = Array.from(event.clipboardData.items).find(
			(item) => item.kind === "file" && item.type.startsWith("image/"),
		);

		if (!imageItem) {
			return;
		}

		event.preventDefault();
		const file = imageItem.getAsFile();
		if (!file) {
			return;
		}

		try {
			const imageUrl = await uploadImageToR2(file);
			setThumbnail(imageUrl);
		} catch (error) {
			console.error(error);
		}
	}, [uploadImageToR2]);

	useEffect(() => {
		if (!mdeInstance) {
			return;
		}

		const codeMirror = mdeInstance.codemirror;
		const onPaste = (_instance: unknown, event: ClipboardEvent) => {
			void handleImagePaste(event);
		};

		codeMirror.on("paste", onPaste);

		return () => {
			codeMirror.off("paste", onPaste);
		};
	}, [handleImagePaste, mdeInstance]);

	const editorOptions = useMemo(
		() => ({
			spellChecker: false,
			status: false,
			placeholder: "# 本文をMarkdownで記述",
		}),
		[],
	);

	return (
		<Container className="flex h-screen min-h-screen flex-col overflow-hidden">
			<Section className="shrink-0">
        <Row className="" gap="sm">
          <Heading tag="h1" fontClass="title1">Blog新規作成</Heading>
					<Row className="justify-between" gap="sm">
						<Button label="仮保存" variant="outline" color="primary" />
						<Button label="公開" variant="fill" color="primary" />
					</Row>
        </Row>
      </Section>
			<Grid columns={2} gap="md" className="min-h-0 flex-1 overflow-hidden p-sm">
				<Section className="h-full min-h-0 overflow-hidden [&>[data-lk-component='section']]:h-full">
					<Container className="h-full">
						<Column gap="sm" className="h-full min-h-0">
							<TextInput
								value={title}
								name="Title"
                endIcon="edit"
								onChange={(event) => setTitle(event.target.value)}
								placeholder="記事タイトル"
							/>
              <TextInput
								value={description}
								name="Description"
                endIcon="edit"
								onChange={(event) => setDescription(event.target.value)}
								placeholder="概要(記事には表示されません)"
							/>
              <TextInput
								value={tags}
								name="Tags"
                endIcon="edit"
								onChange={(event) => setTags(event.target.value)}
								placeholder="検索用タグ（例: react,nextjs）"
							/>
							<Text fontClass="label-bold">Content</Text>
							<div className="min-h-0 flex-1 overflow-hidden">
								<SimpleMDE
									id="post-content"
									value={content}
									onChange={setContent}
									options={editorOptions}
									getMdeInstance={setMdeInstance}
									className={adminEditorMdeStyles.adminEditorMde}
								/>
							</div>
						</Column>
					</Container>
				</Section>

				<Section className="h-full min-h-0 overflow-hidden [&>[data-lk-component='section']]:h-full">
					<Column gap="sm" className="h-full min-h-0 overflow-hidden">
						<TextInput
							value={thumbnail}
							name="thumbnail"
							endIcon="edit"
							onChange={(event) => setThumbnail(event.target.value)}
							onPaste={handleThumbnailPaste}
							placeholder="サムネイル画像をペースト"
						/>
						<Text fontClass="label-bold">一覧ページカードプレビュー</Text>
						<Container className="max-w-xl">
							<PostCard clickable={false} />
						</Container>
						<article className="admin-editor-preview-pane min-h-0 flex-1 space-y-4 overflow-y-auto">
						<h1 className="text-3xl font-bold">{title || "PreView"}</h1>

						<div className={mdStyles.markdownPreview}>
							<ReactMarkdown>{content || ""}</ReactMarkdown>
						</div>
					</article>
					</Column>
				</Section>
			</Grid>
		</Container>
	);
}
