import { Hono } from "hono";
import { AppEnv } from "@/types/context";

export const adminPosts = new Hono<AppEnv>();

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function getExtensionFromFile(file: File) {
  const byName = file.name.split(".").pop()?.toLowerCase();
  if (byName && byName.length <= 5) {
    return byName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

adminPosts.get("/images/:key", async (c) => {
  const r2 = c.env?.R2;
  if (!r2) {
    return c.json({ error: "R2 binding is not configured" }, 500);
  }

  const key = c.req.param("key");
  const object = await r2.get(key);

  if (!object) {
    return c.json({ error: "Not found" }, 404);
  }

  const headers = new Headers();
  const httpMetadata = object.httpMetadata;

  if (httpMetadata?.contentType) {
    headers.set("content-type", httpMetadata.contentType);
  }
  if (httpMetadata?.contentLanguage) {
    headers.set("content-language", httpMetadata.contentLanguage);
  }
  if (httpMetadata?.contentDisposition) {
    headers.set("content-disposition", httpMetadata.contentDisposition);
  }
  if (httpMetadata?.contentEncoding) {
    headers.set("content-encoding", httpMetadata.contentEncoding);
  }
  if (httpMetadata?.cacheControl) {
    headers.set("cache-control", httpMetadata.cacheControl);
  }
  if (httpMetadata?.cacheExpiry) {
    headers.set("expires", httpMetadata.cacheExpiry.toUTCString());
  }
  headers.set("etag", object.httpEtag);

  if (!headers.get("content-type")) {
    headers.set("content-type", "application/octet-stream");
  }

  return new Response(object.body, { headers });
});

adminPosts.post("/upload-image", async (c) => {
  const r2 = c.env?.R2;
  if (!r2) {
    return c.json({ message: "R2 binding is not configured" }, 500);
  }

  const formData = await c.req.formData();
  const image = formData.get("image");

  if (!(image instanceof File)) {
    return c.json({ message: "image is required" }, 400);
  }

  if (!image.type.startsWith("image/")) {
    return c.json({ message: "only image files are supported" }, 400);
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return c.json({ message: "image size exceeds 10MB limit" }, 413);
  }

  const extension = getExtensionFromFile(image);
  const key = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  await r2.put(key, image.stream(), {
    httpMetadata: {
      contentType: image.type,
    },
  });

  const url = new URL(c.req.url);
  const imagePath = `/api/admin/posts/images/${key}`;

  return c.json({
    key,
    url: `${url.origin}${imagePath}`,
    markdownUrl: imagePath,
  });
});

export default adminPosts;
