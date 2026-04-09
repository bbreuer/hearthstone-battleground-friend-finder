import "./globals.css";

export const metadata = {
  title: "Bob's Buddy Board",
  description: "Find Hearthstone Battlegrounds friends, share your boards, and build a better duo queue."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="dotted-glow-bg" aria-hidden="true">
          <div className="dotted-glow-orb dotted-glow-orb-a" />
          <div className="dotted-glow-orb dotted-glow-orb-b" />
          <div className="dotted-glow-orb dotted-glow-orb-c" />
        </div>
        <div className="site-frame">{children}</div>
      </body>
    </html>
  );
}
