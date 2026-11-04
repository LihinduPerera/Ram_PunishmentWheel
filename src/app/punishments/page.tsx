import type { Metadata } from "next";
import { PunishmentsScreen } from "@/components/punishments/punishments-screen";

export const metadata: Metadata = {
  title: "Punishments",
  description:
    "Build the dare pool, search and filter punishments, and tune the difficulty mix.",
};

export default function PunishmentsPage() {
  return <PunishmentsScreen />;
}
