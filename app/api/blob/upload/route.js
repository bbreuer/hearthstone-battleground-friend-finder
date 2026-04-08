import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { createPostForUser } from "@/lib/data";
import { getSession } from "@/lib/session";

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const safePathname = String(pathname || "");
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const contentType = String(payload.contentType || "");

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_UPLOAD_SIZE,
          tokenPayload: JSON.stringify({
            userId: session.userId,
            caption: String(payload.caption || "").trim().slice(0, 120),
            placement: payload.placement ?? null,
            mmr: payload.mmr ?? null,
            contentType,
            pathname: safePathname
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
        if (!payload?.userId) {
          return;
        }

        await createPostForUser(Number(payload.userId), {
          caption: payload.caption || null,
          placement: payload.placement ?? null,
          mmr: payload.mmr ?? null,
          imagePath: blob.url
        });
      }
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
