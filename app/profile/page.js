import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getRecentPostsByUser } from "@/lib/data";
import { getGalleryImageSrc } from "@/lib/blob";
import UploadForm from "./upload-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signed-out");
  }

  const posts = await getRecentPostsByUser(user.id);

  return (
    <main className="app-shell app-shell-spacious">
      <section className="topbar">
        <div>
          <p className="page-label">Profile Editor</p>
          <h1 className="page-title">{user.displayName || user.battletag || "Battlegrounds player"}</h1>
        </div>
        <div className="button-row compact">
          <Link className="secondary-button" href="/hub">
            Back To Hub
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="ghost-button" type="submit">
              Log out
            </button>
          </form>
        </div>
      </section>

      <section className="content-grid">
        <div className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Identity</p>
              <h2>Battle.net linked account</h2>
            </div>
          </div>
          <div className="stack-list">
            <div className="stack-item">
              <span>BattleTag</span>
              <strong>{user.battletag || "Unavailable from Blizzard"}</strong>
            </div>
            <div className="stack-item">
              <span>Profile name</span>
              <strong>{user.displayName || "Not set"}</strong>
            </div>
            <div className="stack-item">
              <span>Region</span>
              <strong>{user.region.toUpperCase()}</strong>
            </div>
            <div className="stack-item">
              <span>Current BG rank</span>
              <strong>{user.bgRank ? user.bgRank.toLocaleString() : "Add your MMR below"}</strong>
            </div>
          </div>
          <div className="button-row compact">
            <Link className="secondary-button" href="/account">
              Back To Account
            </Link>
          </div>
        </div>

        <div className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Edit Profile</p>
              <h2>Friend-finder details</h2>
            </div>
          </div>
          <form action="/api/profile/update" method="post" className="stack-form">
            <label>
              Display name
              <input defaultValue={user.displayName || ""} maxLength={40} name="displayName" />
            </label>
            <label>
              Battlegrounds rank / MMR
              <input defaultValue={user.bgRank || ""} inputMode="numeric" name="bgRank" />
            </label>
            <label>
              Favorite hero
              <input defaultValue={user.favoriteHero || ""} maxLength={60} name="favoriteHero" />
            </label>
            <label>
              Looking for
              <input
                defaultValue={user.lookingForGroup || ""}
                maxLength={120}
                name="lookingForGroup"
                placeholder="Example: Chill duo partner, NA evenings, voice preferred"
              />
            </label>
            <label>
              Bio
              <textarea defaultValue={user.bio || ""} maxLength={280} name="bio" rows={5} />
            </label>
            <button className="primary-button" type="submit">
              Save profile
            </button>
          </form>
        </div>
      </section>

      <section className="section-stack">
        <div className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Upload A Board</p>
              <h2>Share your latest game screenshot</h2>
            </div>
          </div>
          <UploadForm />
        </div>
      </section>

      <section className="section-stack">
        <div className="section-header">
          <div>
            <p className="page-label">Your Gallery</p>
            <h2>Recent uploads</h2>
          </div>
        </div>
        <div className="gallery-grid">
          {posts.length ? (
            posts.map((post) => (
              <article className="gallery-card" key={post.id}>
                {getGalleryImageSrc(post.image_path) ? (
                  <img
                    src={getGalleryImageSrc(post.image_path)}
                    alt={post.caption || "Battleground screenshot"}
                  />
                ) : null}
                <div className="gallery-copy">
                  <strong>{post.caption || "Untitled screenshot"}</strong>
                  <p>Placement {post.placement || "-"} | Match MMR {post.mmr || "-"}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state wide">You have not uploaded a game yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
