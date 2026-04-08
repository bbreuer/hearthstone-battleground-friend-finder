import { NextResponse } from "next/server";

function isAllowedBlobHost(hostname) {
  return hostname.endsWith(".blob.vercel-storage.com");
}

export async function GET(request) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src || !process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse("Missing image source.", { status: 400 });
  }

  let url;
  try {
    url = new URL(src);
  } catch {
    return new NextResponse("Invalid image source.", { status: 400 });
  }

  if (!isAllowedBlobHost(url.hostname)) {
    return new NextResponse("Unsupported image source.", { status: 400 });
  }

  const upstream = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
    }
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Image unavailable.", { status: upstream.status || 404 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type");
  const cacheControl = upstream.headers.get("cache-control");

  headers.set("content-type", contentType || "application/octet-stream");
  headers.set("cache-control", cacheControl || "public, max-age=300");

  return new NextResponse(upstream.body, {
    status: 200,
    headers
  });
}
