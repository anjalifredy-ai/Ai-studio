"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/chat", label: "💬 Chat" },
    { href: "/solve", label: "📚 Homework Solver" },
  ];

  return (
    <header className="border-b border-border bg-panel sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg flex items-center gap-2">
          <span className="text-accent">🎓</span>
          <span>HomeworkAI</span>
        </Link>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === tab.href
                  ? "bg-accent text-white"
                  : "text-textdim hover:text-textmain hover:bg-panel2"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}