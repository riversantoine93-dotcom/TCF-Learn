import {describe,it,expect} from 'vitest';
import {createHash} from 'node:crypto';
import depth from '../lib/learning/lesson-depth.json';
import lessons from '../scripts/learning-lessons.json';
import catalog from '../lib/learning/catalog.json';
import {knowledgeSources} from '../lib/knowledge-sources';
import {selfPacedContent} from '../scripts/build-self-paced-lessons.mjs';
import {getFacilitatorGuides} from '../lib/facilitator-guides';
import type {LearningCourse,LearningLesson} from '../lib/learning/types';

describe('Specific source-grounded lesson teaching',()=>{
 it('expands every required lesson in all thirty courses with distinct explanation, application and checks',()=>{
  expect(Object.keys(depth)).toHaveLength(30);let count=0;const unique=new Set<string>();
  for(const course of catalog){const rows=depth[course.slug as keyof typeof depth];expect(rows).toHaveLength(course.lesson_count);
   for(const row of rows){count++;expect(row.title).toBe(course.outline[row.number-1].title);unique.add(row.explanation);
    expect([row.explanation,row.application,row.check].join(' ').split(/\s+/).length).toBeGreaterThanOrEqual(45);
    const lesson=lessons.find(l=>l.course_slug===course.slug&&l.number===row.number)!;
    expect(lesson.content.depthVersion).toBe('source-depth-v1');
    expect(lesson.content.topics[0].paragraphs).toContain(row.explanation);
    expect(lesson.content.topics[1].paragraphs).toContain('Worked application: '+row.application);
    expect(lesson.content.topics[2].paragraphs).toContain('Practical check: '+row.check);
    expect(lesson.content.knowledge.references.some(r=>r.sourceId===row.sourceId)).toBe(true);
    expect(knowledgeSources[row.sourceId]).toBeDefined();
   }
  }
  expect(count).toBe(474);expect(unique.size).toBe(474);
 });
 it('preserves the complete previously published question bank and feedback',()=>{
  const hash=createHash('sha256').update(JSON.stringify(lessons.map(l=>[l.course_slug,l.number,l.content.questions]))).digest('hex');
  expect(hash).toBe('2193ea258a7d7bd6103afdfa417133bbbd57a6e6177fbce0f9c1d1d86884b3cd');
 });
 it('is repeatable without duplicating sources or losing original regulatory notes',()=>{
  for(const lesson of lessons){const course=catalog.find(c=>c.slug===lesson.course_slug)!;const again=selfPacedContent(lesson as LearningLesson,course as LearningCourse);
   expect(again.topics).toEqual(lesson.content.topics);expect(again.knowledge).toEqual(lesson.content.knowledge);
   expect(new Set(again.knowledge!.references.map(r=>r.sourceId)).size).toBe(again.knowledge!.references.length);
  }
  const electrical=lessons.find(l=>l.course_slug==='electrical-foundations'&&l.number===1)!;
  expect(electrical.content.knowledge.references.find(r=>r.sourceId==='osha-electrical')!.note).toContain('29 CFR 1910.333');
 });
 it('carries identical expanded teaching into every facilitator guide',()=>{
  for(const course of catalog){const guides=getFacilitatorGuides(course.slug);for(const guide of guides){const row=depth[course.slug as keyof typeof depth][guide.globalLessonNumber-1];expect(guide.teaching[0].explanation).toContain(row.explanation);expect(guide.teaching[1].explanation).toContain('Worked application: '+row.application);expect(guide.sources.some(s=>s.id===row.sourceId)).toBe(true)}}
 });
 it('contains practical specific examples with clear limits rather than invented statistics',()=>{
  expect(depth['electrical-foundations'][2].application).toContain('12-volt');expect(depth['electrical-foundations'][2].application).toContain('two amperes');
  expect(depth['data-spreadsheets'][11].application).toContain('ten percentage points');
  expect(depth['javascript-foundations'][2].application).toContain("'23'");
  expect(depth['cdl-preparation'][2].check).toContain('not registered ELDT');
  expect(lessons.filter(l=>l.course_slug==='thought-to-freedom').every(l=>l.content.knowledge.references.some(r=>r.note.includes('do not validate')))).toBe(true);
 });
});
