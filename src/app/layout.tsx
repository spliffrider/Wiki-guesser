import type { Metadata, Viewport } from "next";
import { EB_Garamond, Lato } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Wiki Guesser - Guess the Wikipedia Article",
  description: "A trivia game where you guess Wikipedia articles from their content. Test your knowledge!",
  keywords: ["trivia", "wikipedia", "quiz", "game", "knowledge"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wiki Guesser",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B8860B" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1C1E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${lato.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
