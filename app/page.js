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
    <main className="shell shell-spacious">
      <section className="masthead">
        <p className="kicker">Hearthstone Battlegrounds Community</p>
        <h1>Friend Finder Leaderboards</h1>
        <p className="masthead-copy">
          Find Battlegrounds players, compare public rank cards, and share your latest boards in a
          layout inspired by Blizzard&apos;s Hearthstone leaderboard presentation.
        </p>
        <div className="tab-strip">
          <span className="tab active">Friend Finder</span>
          <span className="tab">Recent Boards</span>
          <span className="tab">Battle.net Profiles</span>
        </div>
      </section>

      <section className="hero-board">
        <div className="hero-banner frame-panel">
          <p className="eyebrow">Season Overview</p>
          <h2>Queue smarter and discover active tavern partners.</h2>
          <p className="lede parchment-copy">
            Sign in with Battle.net to create your player card, set your visible BG rank, and upload
            screenshots from your best lobbies. When you log out, your tavern row disappears from the
            active list automatically.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="/api/auth/bnet">
              {user ? "Refresh Battle.net Login" : "Log In With Battle.net"}
            </a>
            <Link className="secondary-button" href={user ? "/account" : "#leaderboard"}>
              {user ? "Open Your Account" : "Browse Players"}
            </Link>
          </div>
        </div>

        <aside className="season-sidecard frame-panel">
          <p className="eyebrow">Your Standing</p>
          {user ? (
            <div className="season-card">
              <span className="crest">{(user.displayName || user.battletag || "B").charAt(0).toUpperCase()}</span>
              <strong>{user.displayName || user.battletag || "Unnamed Battler"}</strong>
              <span>{user.battletag || "BattleTag sync pending"}</span>
              <span className="season-rank">
                BG Rank {user.bgRank ? user.bgRank.toLocaleString() : "Add your MMR"}
              </span>
              <Link href="/account">View member card</Link>
            </div>
          ) : (
            <div className="season-card">
              <span className="crest">?</span>
              <strong>Create your player card</strong>
              <span>BattleTag sync comes from Battle.net.</span>
              <span className="season-rank">Your BG rank appears on your public account page.</span>
              <a href="/api/auth/bnet">Start sign in</a>
            </div>
          )}
        </aside>
      </section>

      <section className="leaderboard-layout" id="leaderboard">
        <div className="frame-panel leaderboard-panel">
          <div className="section-heading centered-heading">
            <p className="eyebrow">Looking For Group</p>
            <h2>Active Tavern Table</h2>
            <p className="section-copy">
              Only players currently logged in appear here, with their profile rank and queue notes.
            </p>
          </div>

          {members.length ? (
            <div className="leaderboard-table">
              <div className="leaderboard-head">
                <span>Rank</span>
                <span>Player</span>
                <span>Favorite Hero</span>
                <span>Looking For</span>
              </div>
              {members.map((member, index) => (
                <article className="leaderboard-row" key={member.id}>
                  <span className="rank-cell">#{index + 1}</span>
                  <div className="player-cell">
                    <span className="mini-crest">
                      {(member.displayName || member.battletag || "B").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{member.displayName || member.battletag || "New Battler"}</strong>
                      <p>
                        {member.battletag || "BattleTag hidden"} • BG Rank{" "}
                        {member.bgRank ? member.bgRank.toLocaleString() : "Unlisted"}
                      </p>
                    </div>
                  </div>
                  <span>{member.favoriteHero || "Not set"}</span>
                  <p>{member.lookingForGroup || "Looking for more friends to queue with."}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state wide">No active battlers right now. Sign in to claim the top row.</p>
          )}
        </div>

        <div className="frame-panel notes-panel">
          <div className="section-heading">
            <p className="eyebrow">How It Works</p>
            <h2>Built like a public member board</h2>
          </div>
          <div className="steps leaderboard-steps">
            <div>
              <strong>Battle.net sign-in</strong>
              <p>Authenticate once and your BattleTag becomes the identity anchor for your account card.</p>
            </div>
            <div>
              <strong>Set your visible BG rank</strong>
              <p>Keep your MMR current so the tavern table feels useful for matchmaking.</p>
            </div>
            <div>
              <strong>Show your boards</strong>
              <p>Upload screenshots from standout games so other players can see your style at a glance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="frame-panel gallery-panel" id="feed">
        <div className="section-heading centered-heading">
          <p className="eyebrow">Board Gallery</p>
          <h2>Recent Battleground posts</h2>
          <p className="section-copy">
            A parchment-style community board for highlighted turns, capped lobbies, and favorite comps.
          </p>
        </div>
        <div className="feed-grid leaderboard-gallery">
          {posts.length ? (
            posts.map((post) => (
              <article className="post-card parchment-card" key={post.id}>
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
              The gallery is empty right now. Log in and post your first board to light up the hall.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
