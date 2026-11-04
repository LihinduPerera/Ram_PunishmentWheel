import type { Metadata } from "next";
import { GameScreen } from "@/components/game/game-screen";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Pick a player, spin the neon punishment wheel, and let fate decide tonight's dare.",
};

export default function HomePage() {
  return <GameScreen />;
}
