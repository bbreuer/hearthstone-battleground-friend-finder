import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";

const featureCards = [
  {
    title: "Find Better Queue Partners",
    copy: "Build a profile with your Battlegrounds rank, favorite hero, and the kind of teammate you want to play with."
  },
  {
    title: "Share Winning Boards",
    copy: "Post polished screenshots from your best lobbies so other players can quickly see your playstyle."
  },
  {
    title: "Use Battle.net Identity",
    copy: "Sign in with Battle.net so your BattleTag becomes the identity behind your public community account."
  }
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/hub");
  }

  return (
    <main className="app-shell marketing-shell">
      <section className="hero-surface">
        <div className="hero-copy">
          <p className="page-label">Battlegrounds Friend Finder</p>
          <h1>Meet players, compare ranks, and post your best boards.</h1>
          <p className="hero-text">
            A cleaner Hearthstone Battlegrounds community space for finding teammates, showing your
            profile, and uploading screenshots from standout games.
          </p>
          <div className="button-row">
            <a className="primary-button" href="/api/auth/bnet">
              Continue With Battle.net
            </a>
            <Link className="secondary-button" href="/signed-out">
              Preview The Flow
            </Link>
          </div>
        </div>

        <div className="hero-panel glass-panel">
          <p className="panel-kicker">What You Get</p>
          <div className="mini-stat-grid">
            <div className="mini-stat">
              <span>Identity</span>
              <strong>BattleTag linked</strong>
            </div>
            <div className="mini-stat">
              <span>Community</span>
              <strong>Active player hub</strong>
            </div>
            <div className="mini-stat">
              <span>Content</span>
              <strong>Board screenshot gallery</strong>
            </div>
            <div className="mini-stat">
              <span>Profile</span>
              <strong>Rank + queue notes</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-stack">
        <div className="section-intro">
          <p className="page-label">Why This Exists</p>
          <h2>A modern companion site for Battlegrounds players.</h2>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article className="glass-panel feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
