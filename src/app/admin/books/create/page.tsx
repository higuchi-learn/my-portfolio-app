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
import { isValidationWarningMessage } from "@/functions/isValidationWarningMessage";
import { getSnackbarColor } from "@/functions/getSnackbarColor";
import { getSnackbarIcon } from "@/functions/getSnackbarIcon";
import { splitCommaSeparated } from "@/functions/splitCommaSeparated";
import { uploadImageToR2 } from "@/functions/uploadImageToR2";
import { pasteImagesIntoEditor } from "@/functions/pasteImagesIntoEditor";
import { getPastedImageFile } from "@/functions/getPastedImageFile";
import { savePost as savePostToApi } from "@/functions/savePost";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function Page() {
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState("");
	const [slug, setSlug] = useState("");
	const [tags, setTags] = useState("");
	const [rating, setRating] = useState("");
	const [content, setContent] = useState("");
	const [saveMessage, setSaveMessage] = useState("");
	const [isSavingDraft, setIsSavingDraft] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [lastSavedAt, setLastSavedAt] = useState<string>("");
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
	const [mdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);

	const savePayload = useMemo(
		() => {
			const parsedRating = rating.trim() ? Number.parseInt(rating.trim(), 10) : undefined;

			return {
				slug: slug.trim(),
				title: title.trim(),
				author: author.trim(),
				description: description.trim(),
				thumbnail: thumbnail.trim() || undefined,
				content,
				tags: tags.trim() || undefined,
				rating: Number.isInteger(parsedRating) ? parsedRating : undefined,
			};
		},
		[author, content, description, rating, slug, tags, thumbnail, title],
	);

	const currentSnapshot = useMemo(() => JSON.stringify(savePayload), [savePayload]);

	const savePost = useCallback(async (status: "draft" | "published", isAutoSave = false) => {
		await savePostToApi({
			status,
			isAutoSave,
			endpoint: "/api/admin/books/create",
			requiredMessage: "Slug / Title / Author / Description / Content を入力してから保存してください。",
			savePayload,
			currentSnapshot,
			lastSavedSnapshot,
			isSavingDraft,
			isPublishing,
			hasRequiredFields: Boolean(
				savePayload.slug
				&& savePayload.title
				&& savePayload.author
				&& savePayload.description
				&& savePayload.content.trim(),
			),
			setSaveMessage,
			setIsSavingDraft,
			setIsPublishing,
			setLastSavedSnapshot,
			setLastSavedAt,
		});
	}, [currentSnapshot, isPublishing, isSavingDraft, lastSavedSnapshot, savePayload]);

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

	const handleImagePaste = useCallback(async (event: ClipboardEvent) => {
		try {
			await pasteImagesIntoEditor(event, mdeInstance, uploadImageToR2, setContent);
		} catch (error) {
			console.error(error);
		}
	}, [mdeInstance, uploadImageToR2]);

	const handleThumbnailPaste = useCallback(async (event: React.ClipboardEvent<HTMLInputElement>) => {
		const file = getPastedImageFile(event.clipboardData);
		if (!file) {
			return;
		}

		event.preventDefault();

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

	const parsedTags = useMemo(() => splitCommaSeparated(tags), [tags]);

	const isValidationWarning = useMemo(
		() => isValidationWarningMessage(saveMessage),
		[saveMessage],
	);

	const snackbarColor = useMemo<LkColorWithOnToken>(
		() => getSnackbarColor(saveMessage, isValidationWarning),
		[isValidationWarning, saveMessage],
	);

	const snackbarIcon = useMemo(
		() => getSnackbarIcon(saveMessage, isValidationWarning),
		[isValidationWarning, saveMessage],
	);

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
					<Heading tag="h1" fontClass="title1">Books新規作成</Heading>
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
								placeholder="書籍タイトル"
							/>
							<TextInput
								value={description}
								name="Description"
								endIcon="edit"
								onChange={(event) => setDescription(event.target.value)}
								placeholder="概要（一覧などに表示）"
							/>
							<TextInput
								value={tags}
								name="Tags"
								endIcon="edit"
								onChange={(event) => setTags(event.target.value)}
								placeholder="検索用タグ（例: engineering,design）"
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
								placeholder="URLスラッグ（例: my-portfolio-app）"
							/>
						</Row>
						<Row gap="sm" defaultChildBehavior="auto-grow">
							<TextInput
								value={author}
								name="Author"
								endIcon="edit"
								onChange={(event) => setAuthor(event.target.value)}
								placeholder="著者名"
							/>
							<TextInput
								value={rating}
								name="Rating"
								endIcon="edit"
								onChange={(event) => setRating(event.target.value)}
								placeholder="評価 1〜5（未入力時は既定値）"
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
