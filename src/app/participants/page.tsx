import type { Metadata } from "next";
import { ParticipantsScreen } from "@/components/participants/participants-screen";

export const metadata: Metadata = {
  title: "Players",
  description:
    "Add, bench, and tune the difficulty profile of everyone in the crew.",
};

export default function ParticipantsPage() {
  return <ParticipantsScreen />;
}
