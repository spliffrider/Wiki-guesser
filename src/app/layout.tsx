import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Wiki Guesser - Guess the Wikipedia Article",
  description: "A trivia game where you guess Wikipedia articles from their content. Test your knowledge!",
  keywords: ["trivia", "wikipedia", "quiz", "game", "knowledge"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

