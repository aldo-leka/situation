import { ProjectConfig } from "@/types";

export const projects: ProjectConfig[] = [
  {
    name: "TableLite",
    emoji: "🍽️",
    description: "Restaurant reservation SaaS",
    trello: {
      boardId: "69998a99cb589d9336138c66",
      listsToShow: ["In Progress 🔨", "Up Next 📋", "Backlog 📦"],
    },
    github: {
      repo: "aldo-leka/TableLite",
    },
  },
  {
    name: "QuizPlus",
    emoji: "🧠",
    description: "AI Quiz platform",
    trello: {
      boardId: "69a2c40ac3c7369ba181f14d",
      listsToShow: ["In Progress", "Sprint Backlog"],
    },
    github: {
      repo: "aldo-leka/ai-quiz-myself",
    },
  },
  {
    name: "tikr-screener",
    emoji: "📊",
    description: "Investment screening pipeline",
    github: {
      repo: "aldo-leka/tikr-screener",
    },
  },
  {
    name: "LeetCode",
    emoji: "💻",
    description: "Daily coding practice",
    type: "daily-habit",
  },
];
