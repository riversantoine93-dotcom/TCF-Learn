import legacyKnowledge from './legacy-lesson-knowledge.json';
import type { CourseSlug } from './courses/types';
import type { LessonKnowledge } from './lesson-knowledge';
export function getLegacyKnowledge(course:CourseSlug, moduleNumber:number, lessonNumber:number):LessonKnowledge {
  if(moduleNumber===0) return {
    example:'A learner receives a frustrating message. The first thought is a prediction of disrespect; the choice point is whether to react immediately or pause and check the facts. The later consequence depends partly on the response chosen.',
    tips:['Write the sequence as situation, thought, choice, action, and consequence. Identify the point where a different thought could support a different responsible action.'],
    softSkill:'Self-awareness',focus:'Notice the thought before acting, separate facts from assumptions, and choose one responsible next response.',
    reset:legacyKnowledge['thought-to-freedom'][0].reset,references:[],
  };
  const knowledge=legacyKnowledge[course][(moduleNumber-1)*3+lessonNumber-1];
  if(!knowledge) throw Error(`Missing lesson knowledge: ${course}/${moduleNumber}/${lessonNumber}`);
  return knowledge;
}
