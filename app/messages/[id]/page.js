import Link from "next/link";
import { redirect } from "next/navigation";
import { getConversationForUser, getCurrentUser } from "@/lib/data";

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

export default async function MessageThreadPage({ params }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signed-out");
  }

  const conversationId = Number(params?.id);
  if (!Number.isFinite(conversationId)) {
    redirect("/inbox");
  }

  const conversation = await getConversationForUser(conversationId, user.id);
  if (!conversation) {
    redirect("/inbox");
  }

  return (
    <main className="app-shell app-shell-spacious">
      <section className="topbar">
        <div>
          <p className="page-label">Conversation</p>
          <h1 className="page-title">
            {conversation.otherDisplayName || conversation.otherBattletag || "Battler"}
          </h1>
        </div>
        <div className="button-row compact">
          <Link className="secondary-button" href="/inbox">
            Back To Inbox
          </Link>
          <Link className="secondary-button" href="/hub">
            Hub
          </Link>
        </div>
      </section>

      <section className="content-grid">
        <section className="glass-panel conversation-panel">
          <div className="message-thread">
            {conversation.messages.length ? (
              conversation.messages.map((message) => {
                const isOwn = message.senderId === user.id;

                return (
                  <article className={`thread-bubble ${isOwn ? "thread-bubble-own" : ""}`} key={message.id}>
                    <div className="thread-meta">
                      <strong>
                        {isOwn
                          ? user.displayName || user.battletag || "You"
                          : message.senderDisplayName || message.senderBattletag || "Battler"}
                      </strong>
                      <span>{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p>{message.body}</p>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">No messages yet. Say hello once the invite is accepted.</p>
            )}
          </div>
        </section>

        <aside className="glass-panel">
          <p className="page-label">Reply</p>
          <h2>Send a message</h2>
          <form action="/api/messages/send" className="stack-form" method="post">
            <input name="conversationId" type="hidden" value={conversation.id} />
            <label>
              Message
              <textarea maxLength={1000} name="body" placeholder="Talk strategy, duo plans, or queue times." rows={8} />
            </label>
            <button className="primary-button" type="submit">
              Send message
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
