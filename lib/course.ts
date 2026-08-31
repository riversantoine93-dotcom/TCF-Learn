export type Module = {
  slug: string;
  number: number;
  title: string;
  description: string;
  lessons: number;
  available: boolean;
};

export const modules: Module[] = [
  { slug: "module-1", number: 1, title: "The Decision to Turn Forward", description: "Rebuild identity, accept responsibility without shame, and create your first forward structure.", lessons: 3, available: true },
  { slug: "module-2", number: 2, title: "Fear Is a Signal, Not a Stop Sign", description: "Recognize fear, interrupt avoidance, and move deliberately while uncertainty is present.", lessons: 3, available: false },
  { slug: "module-3", number: 3, title: "Systems Beat Motivation", description: "Replace emotional momentum with repeatable routines and disciplined systems.", lessons: 3, available: false },
  { slug: "module-4", number: 4, title: "Relationships and Boundaries", description: "Rebuild trust, protect your progress, and define healthy access to your life.", lessons: 3, available: false },
  { slug: "module-5", number: 5, title: "Financial Rebuild Strategy", description: "Develop stability, identify income opportunities, and create a practical 90-day plan.", lessons: 3, available: false },
  { slug: "module-6", number: 6, title: "Purpose Beyond the Pain", description: "Turn lived experience into wisdom, service, value, and a clear personal mission.", lessons: 3, available: false },
  { slug: "module-7", number: 7, title: "Leadership After Loss", description: "Lead with integrity, accountability, service, and influence that does not depend on ego.", lessons: 3, available: false },
  { slug: "module-8", number: 8, title: "Momentum with Intention", description: "Build a personal operating system and a long-term plan for continued forward movement.", lessons: 3, available: false }
];
