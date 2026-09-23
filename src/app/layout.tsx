import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "你Jev了吗? | Have you Jev'd?",
    template: "%s | Jev Trainer",
  },
  description:
    "Three gut checks before you decide: list the answers up front? One look enough? Action or essay? Practice the dock manager's rule on everyday scenarios — fast_lane, decompose, or office.",
  keywords: [
    "Jev",
    "decision making",
    "mental model",
    "quiz",
    "practice",
    "fast_lane",
    "decompose",
    "office",
    "dock manager rule",
    "BYOK AI",
  ],
  authors: [{ name: "leovoon", url: "https://github.com/leovoon" }],
  creator: "leovoon",
  publisher: "leovoon",
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN", "zh_TW"],
    siteName: "Jev Trainer",
    title: "你Jev了吗? | Have you Jev'd?",
    description:
      "3 gut checks. Is this a quick call or a whole thing? Everyday scenarios, casual practice.",
    url: "https://github.com/leovoon/jev-trainer",
  },
  twitter: {
    card: "summary",
    title: "你Jev了吗? | Have you Jev'd?",
    description:
      "3 gut checks. Is this a quick call or a whole thing? Everyday scenarios, casual practice.",
    creator: "@leovoon",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://github.com/leovoon/jev-trainer",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
