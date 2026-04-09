import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";

export default async function SignedOutPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/hub");
  }

  return (
    <main className="app-shell marketing-shell">
      <section className="signed-out-card glass-panel">
        <p className="page-label">Signed Out</p>
        <h1>You have been logged out of the tavern.</h1>
        <p className="hero-text">
          Your player row is no longer visible in the active community list. You can sign back in
          anytime to reopen your hub, profile, and screenshot gallery.
        </p>
        <div className="button-row">
          <a className="primary-button" href="/api/auth/bnet">
            Sign In Again
          </a>
          <Link className="secondary-button" href="/">
            Back To Landing Page
          </Link>
        </div>
      </section>
    </main>
  );
}
