import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeworkAI — Solve Anything",
  description: "Free multi-model AI homework solver and chat assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-textmain antialiased">{children}</body>
    </html>
  );
}