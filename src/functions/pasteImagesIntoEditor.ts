import type EasyMDE from "easymde";

export async function pasteImagesIntoEditor(
  event: ClipboardEvent,
  mdeInstance: EasyMDE | null,
  uploadImage: (file: File) => Promise<string>,
  setContent: (value: string) => void,
) {
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

  for (const item of imageItems) {
    const file = item.getAsFile();
    if (!file) {
      continue;
    }

    const imageUrl = await uploadImage(file);
    if (!imageUrl) {
      continue;
    }

    const baseName = file.name ? file.name.replace(/\.[^/.]+$/, "") : "pasted-image";
    markdownImages.push(`![${baseName}](${imageUrl})`);
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
}
