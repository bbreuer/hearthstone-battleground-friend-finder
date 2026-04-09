import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getRecentPostsByUser } from "@/lib/data";
import { getGalleryImageSrc } from "@/lib/blob";

function getAvatarLetter(user) {
  const source = user.displayName || user.battletag || "B";
  return source.charAt(0).toUpperCase();
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signed-out");
  }

  const posts = await getRecentPostsByUser(user.id, 3);

  return (
    <main className="app-shell app-shell-spacious">
      <section className="topbar">
        <div>
          <p className="page-label">Account</p>
          <h1 className="page-title">{user.displayName || user.battletag || "New Battler"}</h1>
        </div>
        <div className="button-row compact">
          <Link className="secondary-button" href="/inbox">
            Inbox
          </Link>
          <Link className="secondary-button" href="/hub">
            Back To Hub
          </Link>
          <Link className="primary-button" href="/profile">
            Edit Full Profile
          </Link>
        </div>
      </section>

      <section className="content-grid">
        <article className="glass-panel account-summary-card">
          <p className="panel-kicker">Player Card</p>
          <div className="account-identity">
            <div className="avatar-badge" aria-hidden="true">
              {getAvatarLetter(user)}
            </div>
            <div>
              <h2>{user.displayName || user.battletag || "New Battler"}</h2>
              <p>{user.battletag || "BattleTag unavailable"}</p>
            </div>
          </div>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <span>BG Rank</span>
              <strong>{user.bgRank ? user.bgRank.toLocaleString() : "Not set yet"}</strong>
            </div>
            <div className="mini-stat">
              <span>Region</span>
              <strong>{user.region?.toUpperCase() || "US"}</strong>
            </div>
            <div className="mini-stat">
              <span>Favorite Hero</span>
              <strong>{user.favoriteHero || "Choose one"}</strong>
            </div>
            <div className="mini-stat">
              <span>Looking For</span>
              <strong>{user.lookingForGroup || "Update in profile"}</strong>
            </div>
          </div>
        </article>

        <article className="glass-panel">
          <p className="panel-kicker">Status Board</p>
          <h2>What your account already shows</h2>
          <div className="stack-list">
            <div className="stack-item">
              <strong>Battle.net identity</strong>
              <p>Your BattleTag is now linked to this account and used across the site.</p>
            </div>
            <div className="stack-item">
              <strong>Visible battler crest</strong>
              <p>Your member icon is generated from your name so your row stands out in the table.</p>
            </div>
            <div className="stack-item">
              <strong>Rank-ready profile</strong>
              <p>Set or update your BG rank anytime from the full profile editor.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="section-stack">
        <div className="section-header">
          <div>
            <p className="page-label">Recent Boards</p>
            <h2>Your newest uploads</h2>
          </div>
          <Link className="secondary-button" href="/profile">
            Open Upload Manager
          </Link>
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
                  <form action="/api/posts/delete" className="inline-form" method="post">
                    <input name="postId" type="hidden" value={post.id} />
                    <input name="returnTo" type="hidden" value="/account" />
                    <button className="ghost-button danger-button" type="submit">
                      Delete post
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state wide">
              Your account is ready. Head to the full profile page to add rank details and upload your first board.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
