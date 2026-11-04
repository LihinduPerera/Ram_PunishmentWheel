import type { Metadata } from "next";
import { HistoryScreen } from "@/components/history/history-screen";

export const metadata: Metadata = {
  title: "History & Stats",
  description:
    "Every spin, every skip, and every punishment served — with difficulty breakdowns and a leaderboard.",
};

export default function HistoryPage() {
  return <HistoryScreen />;
}
