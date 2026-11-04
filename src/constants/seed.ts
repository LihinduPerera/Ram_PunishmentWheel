import type { Participant, Punishment } from "@/types";

const SEED_TIMESTAMP = 1735689600000;

export const SEED_PARTICIPANTS: Participant[] = [
  {
    id: "player-lihindu",
    name: "Lihindu",
    color: "#c084fc",
    active: true,
    difficulty: "easy",
    createdAt: SEED_TIMESTAMP,
  },
  {
    id: "player-ravindu",
    name: "Ravindu",
    color: "#38bdf8",
    active: true,
    difficulty: "normal",
    createdAt: SEED_TIMESTAMP + 1,
  },
  {
    id: "player-vibodha",
    name: "Vibodha",
    color: "#f472b6",
    active: true,
    difficulty: "normal",
    createdAt: SEED_TIMESTAMP + 2,
  },
  {
    id: "player-malindu",
    name: "Malindu",
    color: "#fb923c",
    active: true,
    difficulty: "normal",
    createdAt: SEED_TIMESTAMP + 3,
  },
  {
    id: "player-pamudith",
    name: "Pamudith",
    color: "#34d399",
    active: true,
    difficulty: "normal",
    createdAt: SEED_TIMESTAMP + 4,
  },
  {
    id: "player-migara",
    name: "Migara",
    color: "#facc15",
    active: true,
    difficulty: "normal",
    createdAt: SEED_TIMESTAMP + 5,
  },
];

export const SEED_PUNISHMENTS: Punishment[] = [
  {
    id: "punish-sing-20",
    title: "Sing a song for 20 seconds",
    description:
      "Pick any song and belt out 20 seconds of it. Confidence counts more than pitch.",
    difficulty: "easy",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP,
  },
  {
    id: "punish-jumping-jacks",
    title: "Do 5 jumping jacks",
    description: "Five. That's it. Get the blood moving and the giggles going.",
    difficulty: "easy",
    active: true,
    category: "Fitness",
    createdAt: SEED_TIMESTAMP + 1,
  },
  {
    id: "punish-funny-accent",
    title: "Talk in a funny accent for one minute",
    description:
      "Choose an accent and stay fully in character for 60 seconds. No breaking.",
    difficulty: "easy",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 2,
  },
  {
    id: "punish-embarrassing-story",
    title: "Tell an embarrassing but comfortable story",
    description:
      "Share a harmless story that makes you cringe just a little. Keep it kind.",
    difficulty: "easy",
    active: true,
    category: "Social",
    createdAt: SEED_TIMESTAMP + 3,
  },
  {
    id: "punish-dance-15",
    title: "Dance for 15 seconds",
    description:
      "No music needed — the group provides the vibe. Commit to every move.",
    difficulty: "easy",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 4,
  },
  {
    id: "punish-funny-faces",
    title: "Make three funny faces",
    description:
      "Three distinct faces. The group scores each one out of ten. No repeats.",
    difficulty: "easy",
    active: true,
    category: "Comedy",
    createdAt: SEED_TIMESTAMP + 5,
  },
  {
    id: "punish-alphabet-backwards",
    title: "Say the alphabet backwards as far as possible",
    description:
      "Start from Z and see how far you get before the alphabet betrays you.",
    difficulty: "easy",
    active: true,
    category: "Brain Teaser",
    createdAt: SEED_TIMESTAMP + 6,
  },
  {
    id: "punish-dance-no-music",
    title: "Dance without music for 30 seconds",
    description:
      "Full performance, total silence. The group may not help you with a beat.",
    difficulty: "medium",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 7,
  },
  {
    id: "punish-only-questions",
    title: "Speak only in questions for two minutes",
    description:
      "Every sentence must be a question. One accidental statement resets the timer.",
    difficulty: "medium",
    active: true,
    category: "Social",
    createdAt: SEED_TIMESTAMP + 8,
  },
  {
    id: "punish-pushups",
    title: "Do 15 push-ups",
    description:
      "Fifteen reps, with knees or an easier variation if you need it. Safety first.",
    difficulty: "medium",
    active: true,
    category: "Fitness",
    createdAt: SEED_TIMESTAMP + 9,
  },
  {
    id: "punish-movie-scene",
    title: "Perform a dramatic movie scene",
    description:
      "Pick a famous scene and give it everything. Overacting is strongly encouraged.",
    difficulty: "medium",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 10,
  },
  {
    id: "punish-make-laugh",
    title: "Make everyone laugh within 30 seconds",
    description:
      "The clock starts now. Any clean joke, bit, or face is fair game.",
    difficulty: "medium",
    active: true,
    category: "Comedy",
    createdAt: SEED_TIMESTAMP + 11,
  },
  {
    id: "punish-chair-apology",
    title: "Give a dramatic apology to a chair",
    description:
      "The chair has been through a lot. Deliver a heartfelt, theatrical apology.",
    difficulty: "medium",
    active: true,
    category: "Comedy",
    createdAt: SEED_TIMESTAMP + 12,
  },
  {
    id: "punish-comedy-show",
    title: "Perform a one-minute comedy show",
    description:
      "You are the headliner. One minute of jokes, stories, or chaotic observations.",
    difficulty: "hard",
    active: true,
    category: "Comedy",
    createdAt: SEED_TIMESTAMP + 13,
  },
  {
    id: "punish-impression",
    title: "Do an impression of someone in the group",
    description:
      "Choose someone in the room and capture their energy. Keep it affectionate.",
    difficulty: "hard",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 14,
  },
  {
    id: "punish-dramatic-song",
    title: "Sing a song dramatically in front of everyone",
    description:
      "Full diva energy. Eye contact, emotion, and at least one dramatic pause.",
    difficulty: "hard",
    active: true,
    category: "Performance",
    createdAt: SEED_TIMESTAMP + 15,
  },
  {
    id: "punish-improvised-ad",
    title: "Perform an improvised advertisement for a random object",
    description:
      "The group picks an everyday object. You have 45 seconds to sell it.",
    difficulty: "hard",
    active: true,
    category: "Creative",
    createdAt: SEED_TIMESTAMP + 16,
  },
  {
    id: "punish-fictional-life",
    title: "Tell a completely fictional dramatic life story",
    description:
      "Invent an epic backstory with at least one twist. Commit to the bit.",
    difficulty: "hard",
    active: true,
    category: "Creative",
    createdAt: SEED_TIMESTAMP + 17,
  },
];

export const RESULT_HEADLINES = [
  "OH NO! 😈",
  "FATE HAS CHOSEN 🔮",
  "NO ESCAPE 💀",
  "THE WHEEL SPOKE 🎲",
  "WELL, WELL, WELL… 👀",
  "DESTINY CALLED ☎️",
  "THE AUDACITY 😭",
  "LIGHTS, CAMERA, CHAOS 🎬",
] as const;

export function cloneSeedParticipants(): Participant[] {
  return SEED_PARTICIPANTS.map((participant) => ({ ...participant }));
}

export function cloneSeedPunishments(): Punishment[] {
  return SEED_PUNISHMENTS.map((punishment) => ({ ...punishment }));
}
