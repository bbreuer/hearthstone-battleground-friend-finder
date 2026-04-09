import Link from "next/link";
import { redirect } from "next/navigation";
import { getGalleryImageSrc } from "@/lib/blob";
import {
  getCommunityMembers,
  getCurrentUser,
  getMemberMessagingState,
  getPendingInviteCount,
  getRecentPosts
} from "@/lib/data";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(date));
}

export default async function HubPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const members = await getCommunityMembers(8);
  const posts = await getRecentPosts(9);
  const inviteCount = await getPendingInviteCount(user.id);
  const memberState = await getMemberMessagingState(
    user.id,
    members.filter((member) => member.id !== user.id).map((member) => member.id)
  );

  return (
    <main className="app-shell app-shell-spacious">
      <section className="topbar">
        <div>
          <p className="page-label">Community Hub</p>
          <h1 className="page-title">Welcome back, {user.displayName || user.battletag || "Battler"}.</h1>
        </div>
        <div className="button-row compact">
          <Link className="secondary-button" href="/inbox">
            Inbox{inviteCount ? ` (${inviteCount})` : ""}
          </Link>
          <Link className="secondary-button" href="/account">
            Account
          </Link>
          <Link className="secondary-button" href="/profile">
            Edit Profile
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="ghost-button" type="submit">
              Log out
            </button>
          </form>
        </div>
      </section>

      <section className="hero-grid">
        <article className="glass-panel hero-card">
          <p className="panel-kicker">Your Battlegrounds Card</p>
          <h2>{user.displayName || user.battletag || "Unnamed Battler"}</h2>
          <p className="hero-text">
            Keep your rank current, tune your queue notes, and use your profile as your public
            landing spot inside the community.
          </p>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <span>BattleTag</span>
              <strong>{user.battletag || "Unavailable"}</strong>
            </div>
            <div className="mini-stat">
              <span>BG Rank</span>
              <strong>{user.bgRank ? user.bgRank.toLocaleString() : "Add your MMR"}</strong>
            </div>
            <div className="mini-stat">
              <span>Region</span>
              <strong>{user.region?.toUpperCase() || "US"}</strong>
            </div>
            <div className="mini-stat">
              <span>Favorite Hero</span>
              <strong>{user.favoriteHero || "Not set"}</strong>
            </div>
          </div>
        </article>

        <article className="glass-panel spotlight-card">
          <p className="panel-kicker">Quick Actions</p>
          <div className="action-list">
            <Link className="action-link" href="/inbox">
              Review message invites and active chats
            </Link>
            <Link className="action-link" href="/profile">
              Update rank, bio, and queue preferences
            </Link>
            <Link className="action-link" href="/account">
              View your public account page
            </Link>
            <Link className="action-link" href="/profile">
              Post a new board screenshot
            </Link>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <section className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Active Players</p>
              <h2>Queue-ready tavern table</h2>
            </div>
          </div>
          <div className="player-list">
            {members.length ? (
              members.map((member, index) => (
                <article className="player-card" key={member.id}>
                  <div className="player-rank">#{index + 1}</div>
                  <div className="player-main">
                    <strong>{member.displayName || member.battletag || "New Battler"}</strong>
                    <p>{member.battletag || "BattleTag hidden"}</p>
                  </div>
                  <div className="player-meta">
                    <span>BG Rank {member.bgRank ? member.bgRank.toLocaleString() : "Unlisted"}</span>
                    <span>{member.favoriteHero || "Favorite hero not set"}</span>
                  </div>
                  <p className="player-note">
                    {member.lookingForGroup || "Looking for more Battlegrounds friends to queue with."}
                  </p>
                  {member.id !== user.id ? (
                    <div className="player-actions">
                      {memberState[member.id]?.conversationId ? (
                        <Link className="secondary-button" href={`/messages/${memberState[member.id].conversationId}`}>
                          Open chat
                        </Link>
                      ) : memberState[member.id]?.inviteDirection === "outgoing" ? (
                        <span className="status-pill">Invite sent</span>
                      ) : memberState[member.id]?.inviteDirection === "incoming" ? (
                        <Link className="secondary-button" href="/inbox">
                          Respond in inbox
                        </Link>
                      ) : (
                        <form action="/api/messages/invite" className="inline-form" method="post">
                          <input name="receiverId" type="hidden" value={member.id} />
                          <input name="returnTo" type="hidden" value="/hub" />
                          <button className="secondary-button" type="submit">
                            Invite to message
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <span className="status-pill">You</span>
                  )}
                </article>
              ))
            ) : (
              <p className="empty-state">No players are online yet.</p>
            )}
          </div>
        </section>

        <aside className="glass-panel side-panel">
          <p className="page-label">Community Snapshot</p>
          <h2>What people see first</h2>
          <div className="stack-list">
            <div className="stack-item">
              <strong>Visible rank</strong>
              <p>Your BG rating helps other players decide who they want to queue with.</p>
            </div>
            <div className="stack-item">
              <strong>Queue preferences</strong>
              <p>Short notes make it easy to find players with the same vibe and schedule.</p>
            </div>
            <div className="stack-item">
              <strong>Board gallery</strong>
              <p>Screenshots make profiles feel alive instead of looking like empty stat sheets.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-stack">
        <div className="section-header">
          <div>
            <p className="page-label">Recent Boards</p>
            <h2>Latest community uploads</h2>
          </div>
          <Link className="secondary-button" href="/profile">
            Upload Yours
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
                  <div className="gallery-meta">
                    <div>
                      <strong>{post.display_name || post.battletag || "Anonymous Battler"}</strong>
                      <p>{post.battletag || "Unknown BattleTag"}</p>
                    </div>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <p>{post.caption || "No caption yet."}</p>
                  <div className="tag-row">
                    <span>Placement {post.placement || "-"}</span>
                    <span>MMR {post.mmr ? post.mmr.toLocaleString() : "-"}</span>
                    <span>Profile Rank {post.bg_rank ? post.bg_rank.toLocaleString() : "-"}</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state">The gallery is empty right now. Be the first to post a winning board.</p>
          )}
        </div>
      </section>
    </main>
  );
}
