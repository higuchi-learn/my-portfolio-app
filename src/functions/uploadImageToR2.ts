export async function uploadImageToR2(file: File) {
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
}
