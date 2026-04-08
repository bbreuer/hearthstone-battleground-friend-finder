"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function toNullableNumber(value) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export default function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const file = formData.get("screenshot");
    if (!(file instanceof File) || file.size === 0) {
      setError("Choose an image before posting.");
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Use a PNG, JPG, or WEBP image.");
      return;
    }

    const payload = {
      caption: String(formData.get("caption") || "").trim().slice(0, 120),
      placement: toNullableNumber(formData.get("placement")),
      mmr: toNullableNumber(formData.get("mmr")),
      contentType: file.type
    };

    try {
      const pathname = `boards/${Date.now()}-${sanitizeFilename(file.name || "board-upload.png")}`;
      await upload(pathname, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/api/blob/upload",
        multipart: file.size > 4_000_000,
        clientPayload: JSON.stringify(payload)
      });

      startTransition(() => {
        router.refresh();
      });
      event.currentTarget.reset();
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
    }
  }

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <label>
        Caption
        <input maxLength={120} name="caption" placeholder="Turn 10 Mech scam into first place" />
      </label>
      <div className="form-row">
        <label>
          Placement
          <input inputMode="numeric" max="8" min="1" name="placement" />
        </label>
        <label>
          Match MMR
          <input inputMode="numeric" name="mmr" />
        </label>
      </div>
      <label>
        Screenshot image
        <input accept="image/png,image/jpeg,image/webp" name="screenshot" required type="file" />
      </label>
      <button className="primary-button" disabled={isPending} type="submit">
        {isPending ? "Posting..." : "Post to the gallery"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
