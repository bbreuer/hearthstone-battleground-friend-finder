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
    <main className="shell profile-shell">
      <section className="account-hero panel">
        <div className="account-summary">
          <div className="avatar-badge" aria-hidden="true">
            {getAvatarLetter(user)}
          </div>
          <div>
            <p className="eyebrow">Account Created</p>
            <h1>{user.displayName || user.battletag || "New Battler"}</h1>
            <p className="lede compact">
              Your Battle.net account is connected. This is your member card for the website, and it is
              where other Battlegrounds players can spot your name and rank.
            </p>
          </div>
        </div>

        <div className="account-actions">
          <Link className="secondary-button" href="/">
            Back To Home
          </Link>
          <Link className="primary-button" href="/profile">
            Edit Full Profile
          </Link>
        </div>
      </section>

      <section className="account-grid">
        <article className="panel account-card">
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
        </article>

        <article className="panel account-card">
          <p className="eyebrow">Next Steps</p>
          <h2>Finish your battler profile</h2>
          <div className="steps">
            <div>
              <strong>Add your BG rank</strong>
              <p>Keep your MMR updated so other players know your current level.</p>
            </div>
            <div>
              <strong>Upload screenshots</strong>
              <p>Share top boards, scam wins, and favorite comps from your recent games.</p>
            </div>
            <div>
              <strong>Find friends faster</strong>
              <p>Set your hero preference and what kind of teammates you are looking for.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <p className="eyebrow">Recent Boards</p>
          <h2>Your newest uploads</h2>
        </div>
        <div className="feed-grid">
          {posts.length ? (
            posts.map((post) => (
              <article className="post-card" key={post.id}>
                <img src={post.image_path} alt={post.caption || "Battleground screenshot"} />
                <div className="post-copy">
                  <strong>{post.caption || "Untitled screenshot"}</strong>
                  <p>Placement {post.placement || "-"} | Match MMR {post.mmr || "-"}</p>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state wide">
              Your account is live. Head to your full profile to add rank details and upload your first board.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
