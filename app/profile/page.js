import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getRecentPostsByUser } from "@/lib/data";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const posts = await getRecentPostsByUser(user.id);

  return (
    <main className="shell shell-spacious">
      <section className="masthead compact-masthead">
        <p className="kicker">Profile Editor</p>
        <h1>{user.displayName || user.battletag || "Battlegrounds player"}</h1>
        <p className="masthead-copy">
          Update your friend-finder details, BG rank, and screenshot gallery from one management page.
        </p>
      </section>

      <section className="profile-grid">
        <div className="frame-panel">
          <div className="section-heading">
            <p className="eyebrow">Identity</p>
            <h2>Battle.net linked account</h2>
          </div>
          <div className="identity-stack">
            <div className="stat-row">
              <span>BattleTag</span>
              <strong>{user.battletag || "Unavailable from Blizzard"}</strong>
            </div>
            <div className="stat-row">
              <span>Profile name</span>
              <strong>{user.displayName || "Not set"}</strong>
            </div>
            <div className="stat-row">
              <span>Region</span>
              <strong>{user.region.toUpperCase()}</strong>
            </div>
            <div className="stat-row">
              <span>Current BG rank</span>
              <strong>{user.bgRank ? user.bgRank.toLocaleString() : "Add your MMR below"}</strong>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="secondary-button" href="/account">
              Back To Account
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="ghost-button" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="frame-panel">
          <div className="section-heading">
            <p className="eyebrow">Edit Profile</p>
            <h2>Friend-finder details</h2>
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

      <section className="frame-panel upload-panel">
        <div className="section-heading">
          <p className="eyebrow">Upload A Board</p>
          <h2>Share your latest game screenshot</h2>
        </div>
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
          <button className="primary-button" type="submit">
            Post to the gallery
          </button>
        </form>
      </section>

      <section className="frame-panel gallery-panel">
        <div className="section-heading centered-heading">
          <p className="eyebrow">Your Gallery</p>
          <h2>Recent uploads</h2>
        </div>
        <div className="feed-grid leaderboard-gallery">
          {posts.length ? (
            posts.map((post) => (
              <article className="post-card parchment-card" key={post.id}>
                <img src={post.image_path} alt={post.caption || "Battleground screenshot"} />
                <div className="post-copy">
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
