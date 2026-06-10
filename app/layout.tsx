import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "你說的對，但這就是",
  description: "點擊豆腐、鴨血、白飯得分，小心冰水！",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="h-full overflow-hidden bg-stone-950 text-amber-50">
        {children}
      </body>
    </html>
  );
}
