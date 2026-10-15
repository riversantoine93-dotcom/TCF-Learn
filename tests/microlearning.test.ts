import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import lessons from '../scripts/learning-lessons.json';
import catalog from '../lib/learning/catalog.json';
import {selfPacedContent} from '../scripts/build-self-paced-lessons.mjs';
import type {LearningCourse,LearningLesson} from '../lib/learning/types';
import {getFacilitatorGuides,getFacilitatorCourses} from '../lib/facilitator-guides';
import {facilitatorCourseHTML} from '../lib/facilitator-export';
import {buildHabitPlan,readReviews,reviewDue,scheduleReview,reviewStorageKey} from '../lib/learning/microlearning';
import {validateLessonCompletion,certificateEligible} from '../lib/learning/validation';
import MicroLesson from '../components/MicroLesson';

describe('Microlearning across the complete catalog',()=>{
 it('provides seven short chunks, three recall guides and a lesson-specific transfer plan in every course',()=>{
  expect(catalog).toHaveLength(30);expect(lessons).toHaveLength(474);
  for(const course of catalog){
   const rows=lessons.filter(l=>l.course_slug===course.slug);expect(rows).toHaveLength(course.lesson_count);
   for(const row of rows){const m=row.content.microlearning;
    expect(m.version).toBe('micro-v1');expect(m.chunks).toHaveLength(7);
    expect(m.chunks.every(c=>c.minutes>=1&&c.minutes<=4)).toBe(true);
    expect(m.chunks.reduce((sum,c)=>sum+c.minutes,0)).toBe(row.content.minutes);
    expect(new Set(m.chunks.map(c=>c.id)).size).toBe(7);
    expect(m.retrieval).toHaveLength(row.content.topics.length);
    expect(m.retrieval.every(r=>r.prompt.length>30&&r.guide.length>10)).toBe(true);
    expect(m.successCriteria).toHaveLength(3);
    expect(m.connection).toContain('If you choose');
    expect(m.habit.cue).toContain(row.title.includes(': ')?row.title.split(': ').slice(1).join(': ').toLowerCase():row.title.toLowerCase());
    expect(m.habit.routine).toContain(row.content.knowledge.tips[0]);
    expect(m.habit.restart).toContain('next suitable cue');
   }
  }
 });
 it('does not change questions or saved response requirements when runtime content is regenerated',()=>{
  for(const row of lessons){const course=catalog.find(c=>c.slug===row.course_slug)!;const regenerated=selfPacedContent(row as LearningLesson,course as LearningCourse);
   expect(regenerated.questions).toEqual(row.content.questions);expect(regenerated.microlearning).toEqual(row.content.microlearning);
   expect(validateLessonCompletion({reflection:'I identify the scenario facts and explain my decision using the lesson.',action:'I will verify the relevant condition before choosing the next step.',answers:row.content.questions.map(q=>q.correctIndex)},row.content.questions)).toBeNull();
  }
  expect(certificateEligible([1,2,3],[3])).toBe(false);
 });
 it('aligns all 30 printable facilitator packs with the short steps and recall practice',()=>{
  for(const course of getFacilitatorCourses()){
   const guides=getFacilitatorGuides(course.slug),html=facilitatorCourseHTML(course,guides);
   expect(html.match(/<article class="lesson">/g)).toHaveLength(course.lessonCount);
   expect(html.match(/<h3>Microlearning delivery<\/h3>/g)).toHaveLength(course.lessonCount);
   for(const guide of guides){expect(guide.runOfShow.map(s=>s.minutes)).toEqual(guide.microlearning.chunks.map(s=>s.minutes));expect(guide.facilitatorNotes.join(' ')).toContain('unlimited retries')}
  }
 });
 it('initially shows the focus and choices while keeping later teaching and assessment out of the visible panel',()=>{
  const row=lessons[0] as LearningLesson;
  const html=renderToStaticMarkup(createElement(MicroLesson,{lesson:row,draftKey:'test',reflection:'',action:'',answers:[],results:[],completed:false,saving:false,canComplete:false,setReflection:()=>{},setAction:()=>{},setAnswers:()=>{},clearResults:()=>{},complete:()=>{}}));
  expect(html).toContain('Lesson overview');expect(html).toContain('I want to try the scenario');expect(html).toContain('I want to learn the idea');
  expect(html).not.toContain(row.content.topics![1].paragraphs[1]);expect(html).not.toContain('<fieldset');
  expect(html.match(/aria-current="step"/g)).toHaveLength(1);
 });
});

describe('Optional cue, routine and review plans',()=>{
 const review={slug:'cdl-preparation',number:15,title:'Test plan',plan:'My practice plan',prompt:'Recall the lesson',dueAt:200};
 it('creates explicit cue–routine–check plans without a punitive streak',()=>{
  const plan=buildHabitPlan(' I open my task list ',' verify one appointment ',' time and location ');
  expect(plan).toBe('When I open my task list, I will verify one appointment. I will check: time and location. If I miss an opportunity, I will restart at the next suitable cue.');
 });
 it('deduplicates lesson reviews, preserves other courses, and allows learner-chosen spacing',()=>{
  const other={...review,slug:'digital-literacy'};
  const next=scheduleReview([review,other],{...review,dueAt:400});
  expect(next).toHaveLength(2);expect(next[0].dueAt).toBe(400);expect(next[1]).toEqual(other);
  expect(reviewDue(next[0],399)).toBe(false);expect(reviewDue(next[0],400)).toBe(true);
  expect(reviewStorageKey('learner-a')).not.toBe(reviewStorageKey('learner-b'));
 });
 it('ignores corrupted or unsafe stored reviews and caps stored records',()=>{
  expect(readReviews('{broken')).toEqual([]);expect(readReviews('{}')).toEqual([]);
  expect(readReviews(JSON.stringify([review,{...review,slug:'../../elsewhere'},{...review,number:-1},{...review,plan:'x'.repeat(12001)}]))).toEqual([review]);
  expect(scheduleReview(Array.from({length:120},(_,i)=>({...review,number:i+1})),{...review,number:130})).toHaveLength(100);
 });
});
