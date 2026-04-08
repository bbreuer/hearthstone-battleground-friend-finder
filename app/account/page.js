import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getRecentPostsByUser } from "@/lib/data";

function getAvatarLetter(user) {
  const source = user.displayName || user.battletag || "B";
  return source.charAt(0).toUpperCase();
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const posts = await getRecentPostsByUser(user.id, 3);

  return (
    <main className="shell shell-spacious">
      <section className="masthead compact-masthead">
        <p className="kicker">Battle.net Member Card</p>
        <h1>{user.displayName || user.battletag || "New Battler"}</h1>
        <p className="masthead-copy">
          Your website account is live. This page mirrors the official Hearthstone leaderboard feel
          while giving your Battlegrounds profile its own public identity.
        </p>
      </section>

      <section className="account-grid">
        <article className="frame-panel account-card">
          <p className="eyebrow">Player Card</p>
          <div className="account-card-top">
            <div className="avatar-badge large" aria-hidden="true">
              {getAvatarLetter(user)}
            </div>
            <div>
              <h2>{user.displayName || user.battletag || "New Battler"}</h2>
              <p>{user.battletag || "BattleTag unavailable"}</p>
            </div>
          </div>
          <div className="account-stats">
            <div className="stat-tile">
              <span>BG Rank</span>
              <strong>{user.bgRank ? user.bgRank.toLocaleString() : "Not set yet"}</strong>
            </div>
            <div className="stat-tile">
              <span>Region</span>
              <strong>{user.region?.toUpperCase() || "US"}</strong>
            </div>
            <div className="stat-tile">
              <span>Favorite Hero</span>
              <strong>{user.favoriteHero || "Choose one"}</strong>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="secondary-button" href="/">
              Back To Home
            </Link>
            <Link className="primary-button" href="/profile">
              Edit Full Profile
            </Link>
          </div>
        </article>

        <article className="frame-panel account-card">
          <p className="eyebrow">Status Board</p>
          <h2>What your account already shows</h2>
          <div className="steps leaderboard-steps">
            <div>
              <strong>Battle.net identity</strong>
              <p>Your BattleTag is now linked to this account and used across the site.</p>
            </div>
            <div>
              <strong>Visible battler crest</strong>
              <p>Your member icon is generated from your name so your row stands out in the table.</p>
            </div>
            <div>
              <strong>Rank-ready profile</strong>
              <p>Set or update your BG rank anytime from the full profile editor.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="frame-panel gallery-panel">
        <div className="section-heading centered-heading">
          <p className="eyebrow">Recent Boards</p>
          <h2>Your newest uploads</h2>
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
            <p className="empty-state wide">
              Your account is ready. Head to the full profile page to add rank details and upload your first board.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
