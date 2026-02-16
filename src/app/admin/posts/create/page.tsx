"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type EasyMDE from "easymde";
import ReactMarkdown from "react-markdown";
import Container from "@/components/LiftKit/container";
import Column from "@/components/LiftKit/column";
import Section from "@/components/LiftKit/section";
import Grid from "@/components/LiftKit/grid";
import Heading from "@/components/LiftKit/heading";
import TextInput from "@/components/LiftKit/text-input";
import Button from "@/components/LiftKit/button";
import Text from "@/components/LiftKit/text";
import Row from "@/components/LiftKit/row";
import Icon from "@/components/LiftKit/icon";
import Badge from "@/components/LiftKit/badge";
import PostCard from "@/components/layouts/PostCard";
import Snackbar from "@/components/LiftKit/snackbar";
import mdStyles from "@/app/markdown-preview.module.css";
import adminEditorMdeStyles from "@/app/admin/admin-editor-mde.module.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function Page() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState("");
	const [slug, setSlug] = useState("");
	const [tags, setTags] = useState("");
	const [content, setContent] = useState("");
	const [saveMessage, setSaveMessage] = useState("");
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState<string>("");
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
	const [mdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);

	const savePayload = useMemo(
		() => ({
			slug: slug.trim(),
			title: title.trim(),
			description: description.trim(),
			thumbnail: thumbnail.trim() || undefined,
			content,
			tags: tags.trim() || undefined,
		}),
		[content, description, slug, tags, thumbnail, title],
	);

	const currentSnapshot = useMemo(() => JSON.stringify(savePayload), [savePayload]);

	const formatSavedAt = useCallback((date: Date) => {
		const pad = (value: number) => String(value).padStart(2, "0");
		return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	}, []);

	const savePost = useCallback(async (status: "draft" | "published", isAutoSave = false) => {
		if (isSavingDraft || isPublishing) {
			return;
		}

		if (!savePayload.slug || !savePayload.title || !savePayload.description || !savePayload.content.trim()) {
			if (!isAutoSave) {
				setSaveMessage("Slug / Title / Description / Content を入力してから保存してください。");
			}
			return;
		}

		if (isAutoSave && currentSnapshot === lastSavedSnapshot) {
			return;
		}

		if (status === "draft") {
			setIsSavingDraft(true);
			setSaveMessage(isAutoSave ? "自動保存中..." : "仮保存中...");
		} else {
			setIsPublishing(true);
			setSaveMessage("公開中...");
		}

		try {
			const response = await fetch("/api/admin/posts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...savePayload,
					status,
				}),
			});

			if (!response.ok) {
				const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
				setSaveMessage(errorBody?.message ?? (status === "draft" ? "仮保存に失敗しました。" : "公開に失敗しました。"));
				return;
			}

			setLastSavedSnapshot(currentSnapshot);
			setLastSavedAt(formatSavedAt(new Date()));
			if (status === "draft") {
				setSaveMessage(isAutoSave ? "自動保存しました。" : "仮保存しました。");
			} else {
				setSaveMessage("公開しました。");
			}
		} catch (error) {
			console.error(error);
			if (!isAutoSave) {
				setSaveMessage(status === "draft" ? "通信エラーにより仮保存できませんでした。" : "通信エラーにより公開できませんでした。");
			}
		} finally {
			if (status === "draft") {
				setIsSavingDraft(false);
			} else {
				setIsPublishing(false);
			}
		}
	}, [currentSnapshot, formatSavedAt, isPublishing, isSavingDraft, lastSavedSnapshot, savePayload]);

	const handleDraftSave = useCallback(async () => {
		await savePost("draft");
	}, [savePost]);

	const handlePublishSave = useCallback(async () => {
		await savePost("published");
	}, [savePost]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			void savePost("draft", true);
		}, 3 * 60 * 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [savePost]);

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

	const parsedTags = useMemo(
		() => tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
		[tags],
	);

	const isValidationWarning = useMemo(
		() => saveMessage.includes("入力してから保存してください。"),
		[saveMessage],
	);

	const snackbarColor = useMemo<LkColorWithOnToken>(() => {
		if (!saveMessage) {
			return "surface";
		}

		if (isValidationWarning) {
			return "errorcontainer";
		}

		if (saveMessage.includes("失敗") || saveMessage.includes("エラー")) {
			return "error";
		}

		return "surface";
	}, [isValidationWarning, saveMessage]);

	const snackbarIcon = useMemo(() => {
		if (!saveMessage) {
			return "circle-check" as const;
		}

		if (isValidationWarning) {
			return "circle-alert" as const;
		}

		if (saveMessage.includes("失敗") || saveMessage.includes("エラー")) {
			return "triangle-alert" as const;
		}

		return "circle-check" as const;
	}, [isValidationWarning, saveMessage]);

	return (
		<Container className="flex h-screen min-h-screen flex-col overflow-hidden">
			{saveMessage && (
				<div className="pointer-events-none fixed left-1/2 top-sm z-50 -translate-x-1/2 m-sm">
					<div className="pointer-events-auto">
						<Snackbar globalColor={snackbarColor}>
							<Icon name={snackbarIcon} />
							<Text>{saveMessage}</Text>
							<Button
								label="閉じる"
								variant="text"
								onClick={() => setSaveMessage("")}
							/>
						</Snackbar>
					</div>
				</div>
			)}
			<Section className="shrink-0 p-sm">
        <Row gap="sm" alignItems="center" justifyContent="space-between">
          <Heading tag="h1" fontClass="title1">Blog新規作成</Heading>
					<Row gap="sm" alignItems="center">
						<Row className="border rounded-xs p-xs" gap="xs" alignItems="center">
							<Badge icon="save" color="success" scale="md" iconStrokeWidth={2} />
							<Text fontClass="heading">最終保存時刻: {lastSavedAt || "--:--:--"}</Text>
						</Row>
						<Button
							label={isSavingDraft ? "保存中..." : "仮保存"}
							variant="outline"
							color="primary"
							onClick={() => {
								void handleDraftSave();
							}}
							disabled={isSavingDraft || isPublishing}
						/>
						<Button
							label={isPublishing ? "公開中..." : "公開"}
							variant="fill"
							color="primary"
							onClick={() => {
								void handlePublishSave();
							}}
							disabled={isSavingDraft || isPublishing}
						/>
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
						<Row gap="sm" defaultChildBehavior="auto-grow">
							<TextInput
								value={thumbnail}
								name="Thumbnail"
								endIcon="edit"
								onChange={(event) => setThumbnail(event.target.value)}
								onPaste={handleThumbnailPaste}
								placeholder="サムネイル画像をペースト"
							/>
							<TextInput
								value={slug}
								name="Slug"
								endIcon="edit"
								onChange={(event) => setSlug(event.target.value)}
								placeholder="URLスラッグ（例: portfolio-v1）"
							/>
						</Row>
						<Text fontClass="label-bold">一覧ページカードプレビュー</Text>
						<Container className="max-w-xl">
							<PostCard
								clickable={false}
								title={title || "title"}
								description={description || "description"}
								thumbnail={thumbnail}
								tags={parsedTags.length > 0 ? parsedTags : ["タグ"]}
							/>
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
