"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import { formatSavedAt } from "@/functions/formatSavedAt";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

type WorkStatus = "draft" | "published" | "archived";

interface WorkDetail {
	slug: string;
	title: string;
	description: string;
	thumbnail: string | null;
	content: string;
	techStack: string | null;
	repositoryUrl: string | null;
	siteUrl: string | null;
	status: WorkStatus;
	updatedAt: string;
}

export default function Page() {
	const params = useParams<{ slug: string }>();
	const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [thumbnail, setThumbnail] = useState("");
	const [postSlug, setPostSlug] = useState("");
	const [techStack, setTechStack] = useState("");
	const [repositoryUrl, setRepositoryUrl] = useState("");
	const [siteUrl, setSiteUrl] = useState("");
	const [content, setContent] = useState("");
	const [status, setStatus] = useState<WorkStatus>("draft");
	const [saveMessage, setSaveMessage] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSavingStatus, setIsSavingStatus] = useState<WorkStatus | null>(null);
	const [lastSavedAt, setLastSavedAt] = useState<string>("");
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState("");
	const [mdeInstance, setMdeInstance] = useState<EasyMDE | null>(null);

	const savePayload = useMemo(
		() => ({
			slug: postSlug.trim(),
			title: title.trim(),
			description: description.trim(),
			thumbnail: thumbnail.trim() || undefined,
			content,
			techStack: techStack.trim() || undefined,
			repositoryUrl: repositoryUrl.trim() || undefined,
			siteUrl: siteUrl.trim() || undefined,
		}),
		[content, description, postSlug, repositoryUrl, siteUrl, techStack, thumbnail, title],
	);

	const currentSnapshot = useMemo(() => JSON.stringify(savePayload), [savePayload]);

	useEffect(() => {
		const fetchWork = async () => {
			try {
				const response = await fetch(`/api/admin/works/${slug}`, { cache: "no-store" });
				if (!response.ok) {
					throw new Error("作品の取得に失敗しました。");
				}

				const data = (await response.json()) as WorkDetail;
				setTitle(data.title ?? "");
				setDescription(data.description ?? "");
				setThumbnail(data.thumbnail ?? "");
				setPostSlug(data.slug ?? "");
				setTechStack(data.techStack ?? "");
				setRepositoryUrl(data.repositoryUrl ?? "");
				setSiteUrl(data.siteUrl ?? "");
				setContent(data.content ?? "");
				setStatus(data.status ?? "draft");
				setLastSavedAt(formatSavedAt(new Date(data.updatedAt)));

				setLastSavedSnapshot(
					JSON.stringify({
						slug: data.slug ?? "",
						title: data.title ?? "",
						description: data.description ?? "",
						thumbnail: data.thumbnail ?? undefined,
						content: data.content ?? "",
						techStack: data.techStack ?? undefined,
						repositoryUrl: data.repositoryUrl ?? undefined,
						siteUrl: data.siteUrl ?? undefined,
					}),
				);
			} catch (error) {
				console.error(error);
				setSaveMessage("作品データの読み込みに失敗しました。");
			} finally {
				setIsLoading(false);
			}
		};

		if (slug) {
			void fetchWork();
		}
	}, [slug]);

	const savePost = useCallback(async (nextStatus: WorkStatus, isAutoSave = false) => {
		if (isSavingStatus) {
			return;
		}

		const hasRequiredFields = Boolean(
			savePayload.slug
			&& savePayload.title
			&& savePayload.description
			&& savePayload.content.trim(),
		);

		if (!hasRequiredFields) {
			if (!isAutoSave) {
				setSaveMessage("Slug / Title / Description / Content を入力してから保存してください。");
			}
			return;
		}

		if (isAutoSave && currentSnapshot === lastSavedSnapshot) {
			return;
		}

		setIsSavingStatus(nextStatus);
		if (!isAutoSave) {
			if (nextStatus === "published") {
				setSaveMessage("公開中...");
			} else if (nextStatus === "archived") {
				setSaveMessage("アーカイブ中...");
			} else {
				setSaveMessage("下書き保存中...");
			}
		}

		try {
			const response = await fetch("/api/admin/works/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...savePayload,
					status: nextStatus,
				}),
			});

			if (!response.ok) {
				const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
				setSaveMessage(errorBody?.message ?? "保存に失敗しました。");
				return;
			}

			setStatus(nextStatus);
			setLastSavedSnapshot(currentSnapshot);
			setLastSavedAt(formatSavedAt(new Date()));

			if (!isAutoSave) {
				if (nextStatus === "published") {
					setSaveMessage("公開しました。");
				} else if (nextStatus === "archived") {
					setSaveMessage("アーカイブしました。");
				} else {
					setSaveMessage("下書き保存しました。");
				}
			}
		} catch (error) {
			console.error(error);
			if (!isAutoSave) {
				setSaveMessage("通信エラーにより保存できませんでした。");
			}
		} finally {
			setIsSavingStatus(null);
		}
	}, [currentSnapshot, isSavingStatus, lastSavedSnapshot, savePayload]);

	useEffect(() => {
		if (isLoading) {
			return;
		}

		const intervalId = setInterval(() => {
			void savePost(status, true);
		}, 3 * 60 * 1000);

		return () => {
			clearInterval(intervalId);
		};
	}, [isLoading, savePost, status]);

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

	const parsedTechStack = useMemo(() => splitCommaSeparated(techStack), [techStack]);

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

	if (isLoading) {
		return (
			<Container className="p-lg">
				<Text>作品データを読み込み中です...</Text>
			</Container>
		);
	}

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
					<Heading tag="h1" fontClass="title1">Works編集</Heading>
					<Row gap="sm" alignItems="center">
						<Row className="border rounded-xs p-xs" gap="xs" alignItems="center">
							<Badge icon="save" color="success" scale="md" iconStrokeWidth={2} />
							<Text fontClass="heading">最終保存時刻: {lastSavedAt || "--:--:--"}</Text>
						</Row>
						<Button
							label={isSavingStatus === "draft" ? "保存中..." : "下書き"}
							variant="outline"
							color="primary"
							onClick={() => {
								void savePost("draft");
							}}
							disabled={isSavingStatus !== null}
						/>
						<Button
							label={isSavingStatus === "published" ? "公開中..." : "公開"}
							variant="fill"
							color="primary"
							onClick={() => {
								void savePost("published");
							}}
							disabled={isSavingStatus !== null}
						/>
						<Button
							label={isSavingStatus === "archived" ? "処理中..." : "アーカイブ"}
							variant="outline"
							color="secondary"
							onClick={() => {
								void savePost("archived");
							}}
							disabled={isSavingStatus !== null}
						/>
					</Row>
				</Row>
				<Row className="mt-xs">
					<Text fontClass="caption">現在のステータス: {status}</Text>
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
								placeholder="作品タイトル"
							/>
							<TextInput
								value={description}
								name="Description"
								endIcon="edit"
								onChange={(event) => setDescription(event.target.value)}
								placeholder="概要"
							/>
							<TextInput
								value={techStack}
								name="Tech Stack"
								endIcon="edit"
								onChange={(event) => setTechStack(event.target.value)}
								placeholder="使用技術（例: react,nextjs,cloudflare）"
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
								value={postSlug}
								name="Slug"
								endIcon="edit"
								onChange={(event) => setPostSlug(event.target.value)}
								placeholder="URLスラッグ（例: my-portfolio-app）"
							/>
						</Row>
						<Row gap="sm" defaultChildBehavior="auto-grow">
							<TextInput
								value={repositoryUrl}
								name="Repository URL"
								endIcon="edit"
								onChange={(event) => setRepositoryUrl(event.target.value)}
								placeholder="https://github.com/username/repository"
							/>
							<TextInput
								value={siteUrl}
								name="Site URL"
								endIcon="edit"
								onChange={(event) => setSiteUrl(event.target.value)}
								placeholder="https://example.com"
							/>
						</Row>
						<Text fontClass="label-bold">一覧ページカードプレビュー</Text>
						<Container className="max-w-xl">
							<PostCard
								clickable={false}
								title={title || "title"}
								description={description || "description"}
								thumbnail={thumbnail}
								tags={parsedTechStack.length > 0 ? parsedTechStack : ["Tech"]}
								status={status}
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
