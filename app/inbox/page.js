import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getInboxData } from "@/lib/data";

function formatDateTime(date) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(parsedDate);
}

export default async function InboxPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signed-out");
  }

  const inbox = await getInboxData(user.id);

  return (
    <main className="app-shell app-shell-spacious">
      <section className="topbar">
        <div>
          <p className="page-label">Inbox</p>
          <h1 className="page-title">Message invites and active chats</h1>
        </div>
        <div className="button-row compact">
          <Link className="secondary-button" href="/hub">
            Back To Hub
          </Link>
          <Link className="secondary-button" href="/profile">
            Edit Profile
          </Link>
        </div>
      </section>

      <section className="content-grid">
        <section className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Pending Invites</p>
              <h2>Requests you can approve</h2>
            </div>
          </div>
          <div className="stack-list">
            {inbox.receivedInvites.length ? (
              inbox.receivedInvites.map((invite) => (
                <article className="message-card" key={invite.id}>
                  <div className="message-card-header">
                    <div>
                      <strong>{invite.otherDisplayName || invite.otherBattletag || "Battler"}</strong>
                      <p>
                        {invite.otherBattletag || "Unknown BattleTag"} | BG Rank{" "}
                        {invite.otherBgRank ? invite.otherBgRank.toLocaleString() : "Unlisted"}
                      </p>
                    </div>
                    <span>{formatDateTime(invite.createdAt)}</span>
                  </div>
                  <p>{invite.openerMessage || "This player would like to start a conversation."}</p>
                  <div className="button-row compact">
                    <form action="/api/messages/invite/respond" className="inline-form" method="post">
                      <input name="inviteId" type="hidden" value={invite.id} />
                      <input name="response" type="hidden" value="accepted" />
                      <button className="primary-button" type="submit">
                        Accept
                      </button>
                    </form>
                    <form action="/api/messages/invite/respond" className="inline-form" method="post">
                      <input name="inviteId" type="hidden" value={invite.id} />
                      <input name="response" type="hidden" value="declined" />
                      <button className="ghost-button danger-button" type="submit">
                        Decline
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-state">No pending invites right now.</p>
            )}
          </div>
        </section>

        <aside className="glass-panel">
          <div className="section-header">
            <div>
              <p className="page-label">Outgoing Requests</p>
              <h2>Invites you already sent</h2>
            </div>
          </div>
          <div className="stack-list">
            {inbox.sentInvites.length ? (
              inbox.sentInvites.map((invite) => (
                <div className="stack-item" key={invite.id}>
                  <strong>{invite.otherDisplayName || invite.otherBattletag || "Battler"}</strong>
                  <p>{invite.openerMessage || "Waiting for them to accept your invite."}</p>
                  <span className="subtle-meta">Sent {formatDateTime(invite.createdAt)}</span>
                </div>
              ))
            ) : (
              <p className="empty-state">You have not sent any pending invites.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="section-stack">
        <div className="section-header">
          <div>
            <p className="page-label">Conversations</p>
            <h2>Accepted chats</h2>
          </div>
        </div>
        <div className="stack-list">
          {inbox.conversations.length ? (
            inbox.conversations.map((conversation) => (
              <Link className="message-card conversation-link" href={`/messages/${conversation.id}`} key={conversation.id}>
                <div className="message-card-header">
                  <div>
                    <strong>{conversation.otherDisplayName || conversation.otherBattletag || "Battler"}</strong>
                    <p>{conversation.otherBattletag || "Unknown BattleTag"}</p>
                  </div>
                  <span>{formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}</span>
                </div>
                <p>{conversation.lastMessage || "Conversation opened. Send the first reply."}</p>
              </Link>
            ))
          ) : (
            <p className="empty-state">No accepted conversations yet. Accept an invite to start chatting.</p>
          )}
        </div>
      </section>
    </main>
  );
}
