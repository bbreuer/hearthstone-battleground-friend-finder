import Link from "next/link";
import { getCommunityMembers, getCurrentUser, getRecentPosts } from "@/lib/data";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const members = await getCommunityMembers();
  const posts = await getRecentPosts();

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Hearthstone Battlegrounds Community</p>
          <h1>Find your next duo queue partner and show off your spiciest boards.</h1>
          <p className="lede">
            Battle.net sign-in powers player identity, profile pages keep your BG rank visible,
            and screenshot uploads make every highroll, scam, and perfect lethal easy to share.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="/api/auth/bnet">
              {user ? "Refresh Battle.net Login" : "Log In With Battle.net"}
            </a>
            <Link className="secondary-button" href={user ? "/account" : "#feed"}>
              {user ? "Open Your Account" : "Explore The Tavern"}
            </Link>
          </div>
          <div className="hero-note">
            <span className="chip">BattleTag sync</span>
            <span className="chip">BG rank on profile</span>
            <span className="chip">Screenshot sharing</span>
          </div>
        </div>
        <div className="hero-panel">
          <p className="panel-kicker">Member Snapshot</p>
          {user ? (
            <div className="identity-card">
              <strong>{user.displayName || user.battletag || "Unnamed Battler"}</strong>
              <span>{user.battletag || "BattleTag sync pending"}</span>
              <span>BG Rank: {user.bgRank ? user.bgRank.toLocaleString() : "Add your MMR on your profile"}</span>
              <Link href="/account">Open your account page</Link>
            </div>
          ) : (
            <div className="identity-card">
              <strong>Log in to create your card</strong>
              <span>Your BattleTag comes from Battle.net.</span>
              <span>Your BG rank lives on your public player profile.</span>
              <a href="/api/auth/bnet">Start sign in</a>
            </div>
          )}
        </div>
      </section>

      <section className="section-grid">
        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">Looking For Group</p>
            <h2>Active Tavern Table</h2>
          </div>
          <div className="member-list">
            {members.length ? (
              members.map((member) => (
                <article className="member-card" key={member.id}>
                  <div>
                    <h3>{member.displayName || member.battletag || "New Battler"}</h3>
                    <p>{member.battletag || "BattleTag hidden"}</p>
                  </div>
                  <div className="member-stats">
                    <span>BG Rank {member.bgRank ? member.bgRank.toLocaleString() : "Unlisted"}</span>
                    <span>{member.favoriteHero || "Favorite hero not set"}</span>
                  </div>
                  <p>{member.lookingForGroup || "Looking for more friends to queue with."}</p>
                </article>
              ))
            ) : (
              <p className="empty-state">No adventurers yet. Sign in and become the first profile on the board.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <p className="eyebrow">How It Works</p>
            <h2>Built for a simple MVP</h2>
          </div>
          <div className="steps">
            <div>
              <strong>1. Battle.net login</strong>
              <p>Use Blizzard OAuth to create an account tied to your BattleTag.</p>
            </div>
            <div>
              <strong>2. Set your BG profile</strong>
              <p>Add your Battlegrounds rank, favorite hero, and what kind of teammates you want.</p>
            </div>
            <div>
              <strong>3. Share your boards</strong>
              <p>Upload screenshots from your games so other players can see your playstyle instantly.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="feed-panel" id="feed">
        <div className="section-heading">
          <p className="eyebrow">Board Gallery</p>
          <h2>Recent Battleground posts</h2>
        </div>
        <div className="feed-grid">
          {posts.length ? (
            posts.map((post) => (
              <article className="post-card" key={post.id}>
                <img src={post.image_path} alt={post.caption || "Battleground screenshot"} />
                <div className="post-copy">
                  <div className="post-header">
                    <div>
                      <strong>{post.display_name || post.battletag || "Anonymous Battler"}</strong>
                      <p>{post.battletag || "Unknown BattleTag"}</p>
                    </div>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <p>{post.caption || "No caption yet. Still a board worth posting."}</p>
                  <div className="post-tags">
                    <span>Placement {post.placement || "-"}</span>
                    <span>MMR {post.mmr ? post.mmr.toLocaleString() : "-"}</span>
                    <span>Profile Rank {post.bg_rank ? post.bg_rank.toLocaleString() : "-"}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state wide">
              The feed is empty right now. After you log in, your first uploaded screenshot will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
