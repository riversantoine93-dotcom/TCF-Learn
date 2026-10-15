import type { LessonKnowledge } from "../lesson-knowledge";
export type LearningCourse = {
 slug:string; title:string; description:string; category:'trades'|'technology'|'reentry';
 duration_minutes:number; lesson_count:number; outline:{number:number;title:string}[]; legacy_url:string|null;
 completedLessons?:number[];accessible?:boolean; completed?:number; percent?:number; nextLesson?:number;
};
export type MicrolearningContent={
 version:'micro-v1';focus:string;purpose:string;
 chunks:{id:string;label:string;minutes:number}[];
 retrieval:{prompt:string;guide:string}[];successCriteria:string[];connection:string;
 habit:{cue:string;routine:string;evidence:string;restart:string;reviewPrompt:string};
};
export type LearningContent={microlearning?:MicrolearningContent;version?:string;why?:string;overview?:string;outcomes?:string[];topics?:StudyTopic[];scenario?:{kind:string;text:string};reflectionQuestions?:string[];questions?:import("./validation").AssessmentQuestion[];knowledge?:LessonKnowledge;objective:string;teaching:string;context:string;practice:string;reflection:string;actionPrompt:string;question:string;options:string[];correctIndex:number;feedback:string;minutes:number};
export type LearningLesson={course_slug:string;number:number;title:string;content:LearningContent};
export const CATEGORY_LABELS={trades:'Trade skills',technology:'Technology',reentry:'Reentry & growth'} as const;
export type StudyTopic={title:string;paragraphs:string[]};
