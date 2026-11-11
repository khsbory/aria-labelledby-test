import "./globals.css";

export const metadata = {
  title: "aria-labelledby test",
  description: "Compare how TalkBack reads aria-label vs aria-labelledby button names in Android WebView.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
