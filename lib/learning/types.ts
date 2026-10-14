import type { LessonKnowledge } from "../lesson-knowledge";
export type LearningCourse = {
 slug:string; title:string; description:string; category:'trades'|'technology'|'reentry';
 duration_minutes:number; lesson_count:number; outline:{number:number;title:string}[]; legacy_url:string|null;
 accessible?:boolean; completed?:number; percent?:number; nextLesson?:number;
};
export type LearningContent={knowledge?:LessonKnowledge;objective:string;teaching:string;context:string;practice:string;reflection:string;actionPrompt:string;question:string;options:string[];correctIndex:number;feedback:string;minutes:number};
export type LearningLesson={course_slug:string;number:number;title:string;content:LearningContent};
export const CATEGORY_LABELS={trades:'Trade skills',technology:'Technology',reentry:'Reentry & growth'} as const;
