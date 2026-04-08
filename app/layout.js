import "./globals.css";

export const metadata = {
  title: "Bob's Buddy Board",
  description: "Find Hearthstone Battlegrounds friends, share your boards, and build a better duo queue."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
