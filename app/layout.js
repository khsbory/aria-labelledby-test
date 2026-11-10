import "./globals.css";

export const metadata = {
  title: "aria-labelledby 테스트",
  description: "Android WebView와 TalkBack에서 aria-label과 aria-labelledby 버튼 이름 낭독을 비교하는 테스트 페이지",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
