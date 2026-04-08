export function getGalleryImageSrc(imagePath) {
  if (!imagePath) {
    return null;
  }

  try {
    const url = new URL(imagePath);

    if (url.hostname.endsWith(".blob.vercel-storage.com")) {
      return `/api/blob/file?src=${encodeURIComponent(imagePath)}`;
    }

    if (url.hostname === "vercel.com" && url.pathname.startsWith("/api/blob/")) {
      return null;
    }

    return imagePath;
  } catch {
    return imagePath;
  }
}
