export default function UploadForm() {
  return (
    <form action="/api/posts/create" className="stack-form" encType="multipart/form-data" method="post">
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
      <p className="form-error">Private Blob uploads currently support PNG, JPG, or WEBP files up to 4.5 MB.</p>
      <button className="primary-button" type="submit">
        Post to the gallery
      </button>
    </form>
  );
}
