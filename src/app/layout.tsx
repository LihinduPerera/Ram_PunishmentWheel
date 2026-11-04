import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/layout/app-providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Party Roulette — Punishment Wheel",
    template: "%s · Party Roulette",
  },
  description:
    "A neon party punishment wheel for your friend group. Add players, stack the dares, tune the odds, and let fate decide. Keep it kind, keep it consensual, keep it chaotic.",
  applicationName: "Party Roulette",
  keywords: [
    "punishment wheel",
    "party game",
    "roulette",
    "friend group",
    "party dares",
    "game night",
  ],
  authors: [{ name: "Party Roulette" }],
  openGraph: {
    title: "Party Roulette — Punishment Wheel",
    description:
      "Spin the neon wheel, land on a dare, and accept your fate. A party game for brave friend groups.",
    type: "website",
    siteName: "Party Roulette",
  },
  twitter: {
    card: "summary",
    title: "Party Roulette — Punishment Wheel",
    description:
      "Spin the neon wheel, land on a dare, and accept your fate. A party game for brave friend groups.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07060f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <div className="app-background" aria-hidden="true" />
        <div className="app-grid-overlay" aria-hidden="true" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
