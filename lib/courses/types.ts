export type CourseSlug = "turning-forward" | "thought-to-freedom";

export type QuestionOption = {
  id: string;
  label: string;
  correct?: boolean;
  feedback: string;
};

export type QuestionDefinition = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "key-idea"; text: string }
  | { type: "reflection"; id: string; prompt: string; minChars: number }
  | { type: "knowledge-check"; question: QuestionDefinition }
  | { type: "catch-the-thought"; id: string; prompt: string; statements: string[] }
  | { type: "decision-point"; id: string; scenario: string; prompt: string }
  | { type: "workbook-activity"; id: string; title: string; instructions: string; fields: string[] };

export type CourseLesson = {
  slug: string;
  number: number;
  title: string;
  objective: string;
  blocks: ContentBlock[];
};

export type CourseModule = {
  slug: string;
  number: number;
  title: string;
  coreQuestion: string;
  keyIdea: string;
  description: string;
  lessons: CourseLesson[];
};

export type CourseDefinition = {
  slug: CourseSlug;
  title: string;
  subtitle: string;
  description: string;
  supportingLine?: string;
  orientation?: CourseLesson;
  modules: CourseModule[];
};
