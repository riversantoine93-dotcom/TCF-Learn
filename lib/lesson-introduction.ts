import type { LearningContent } from "./learning/types";
import type { LessonContent } from "./course-content";
import type { CourseLesson } from "./courses/types";

export type LessonIntroductionContent = { overview: string; outcomes: string[]; why: string };

export function learningIntroduction(title: string, content: LearningContent): LessonIntroductionContent {
  const sentences = content.teaching.match(/[^.!?]+[.!?]+(?:[”’"']|$)?|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [content.teaching];
  return {
    overview: `This lesson focuses on ${title.toLowerCase()}. ${sentences[0]}`,
    outcomes: [content.objective, content.practice],
    why: `${sentences.length > 1 ? sentences.slice(1).join(" ") : content.teaching} This skill supports your course goal: ${content.context}`,
  };
}

export function turningForwardIntroduction(lesson: LessonContent): LessonIntroductionContent {
  return {
    overview: lesson.intro,
    outcomes: [`Practice how to ${lesson.sectionTitle.charAt(0).toLowerCase()}${lesson.sectionTitle.slice(1)}.`, `Complete the ${lesson.activityTitle} activity and identify a concrete next step.`],
    why: lesson.sectionBody,
  };
}

export function thoughtIntroduction(lesson: CourseLesson, context?: { title: string; description: string; keyIdea: string }): LessonIntroductionContent {
  const keyIdea = lesson.blocks.find(block => block.type === "key-idea");
  const paragraph = lesson.blocks.find(block => block.type === "paragraph");
  const activity = lesson.blocks.find(block => block.type === "workbook-activity");
  return {
    overview: context ? `${context.title}: ${context.description} In this lesson, you will ${lesson.objective.charAt(0).toLowerCase()}${lesson.objective.slice(1)}` : paragraph?.text || lesson.objective,
    outcomes: [lesson.objective, activity ? activity.instructions : "Examine your own response, practice a responsible choice, and check your understanding."],
    why: context?.keyIdea || keyIdea?.text || "Recognizing the thought before acting creates time to choose a response and consider its consequences.",
  };
}
