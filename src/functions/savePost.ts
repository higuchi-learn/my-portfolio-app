import { formatSavedAt } from "@/functions/formatSavedAt";

type SaveStatus = "draft" | "published";

type SavePostOptions<TPayload> = {
  status: SaveStatus;
  isAutoSave?: boolean;
  endpoint: string;
  requiredMessage: string;
  savePayload: TPayload;
  currentSnapshot: string;
  lastSavedSnapshot: string;
  isSavingDraft: boolean;
  isPublishing: boolean;
  hasRequiredFields: boolean;
  setSaveMessage: (message: string) => void;
  setIsSavingDraft: (value: boolean) => void;
  setIsPublishing: (value: boolean) => void;
  setLastSavedSnapshot: (snapshot: string) => void;
  setLastSavedAt: (time: string) => void;
};

export async function savePost<TPayload>({
  status,
  isAutoSave = false,
  endpoint,
  requiredMessage,
  savePayload,
  currentSnapshot,
  lastSavedSnapshot,
  isSavingDraft,
  isPublishing,
  hasRequiredFields,
  setSaveMessage,
  setIsSavingDraft,
  setIsPublishing,
  setLastSavedSnapshot,
  setLastSavedAt,
}: SavePostOptions<TPayload>) {
  if (isSavingDraft || isPublishing) {
    return;
  }

  if (!hasRequiredFields) {
    if (!isAutoSave) {
      setSaveMessage(requiredMessage);
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
    const response = await fetch(endpoint, {
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
}
