export function getPastedImageFile(dataTransfer: DataTransfer) {
  const imageItem = Array.from(dataTransfer.items).find(
    (item) => item.kind === "file" && item.type.startsWith("image/"),
  );

  if (!imageItem) {
    return null;
  }

  return imageItem.getAsFile();
}
