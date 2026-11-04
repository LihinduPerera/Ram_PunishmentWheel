import type { Metadata } from "next";
import { SettingsScreen } from "@/components/settings/settings-screen";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Tune sound, music, motion, default difficulty, and the per-profile difficulty weight matrix.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
