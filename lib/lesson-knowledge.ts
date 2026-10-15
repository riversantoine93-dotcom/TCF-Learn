export type KnowledgeSource = { id: string; title: string; url: string; kind: 'Regulation' | 'Guidance' | 'Technical reference'; checked: string; uploadedFile?:string; scope?:string };
export type KnowledgeReference = { sourceId: string; note: string; pdfReading?:boolean; lessonReading?:boolean; baselineNote?:string|null };
export type LessonKnowledge = {
  example: string;
  tips: string[];
  softSkill?: string;
  focus?: string;
  reset?: string;
  references: KnowledgeReference[];
};
