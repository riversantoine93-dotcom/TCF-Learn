import {describe,it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import catalog from '../lib/learning/catalog.json';
import notes from '../lib/learning/pdf-lessons.json';
import sources from '../lib/learning/pdf-sources.json';
import lessons from '../scripts/learning-lessons.json';
import {selfPacedContent} from '../scripts/build-self-paced-lessons.mjs';
import {getFacilitatorCourses,getFacilitatorGuides} from '../lib/facilitator-guides';
import {facilitatorCourseHTML} from '../lib/facilitator-export';
import LessonKnowledgeContent from '../components/LessonKnowledgeContent';
import type {LearningLesson,LearningCourse} from '../lib/learning/types';

describe('Uploaded PDF course readings',()=>{
 it('uses the seven new trade PDFs for their own 105 lessons rather than retaining facilities-only supporting readings',()=>{
  const expected={'construction-readiness':'pdf-construction','carpentry-fundamentals':'pdf-carpentry','electrical-foundations':'pdf-electrical','plumbing-foundations':'pdf-plumbing','hvac-foundations':'pdf-hvac','painting-drywall':'pdf-drywall','cdl-preparation':'pdf-cdl'};
  let count=0;for(const [slug,id] of Object.entries(expected))for(const note of notes[slug as keyof typeof notes]){count++;expect(note.sourceId).toBe(id);expect(note.relationship).toBe('matched-course');expect(note.teaching).not.toContain('Supporting workplace skill')}
  expect(count).toBe(105);
 });
 it('distinguishes historic trade background from current qualifications and product-specific instructions',()=>{
  expect(sources.find(s=>s.id==='pdf-cdl')!.scope).toContain('predates modern ELDT');
  expect(notes['cdl-preparation'][2].teaching).toContain('separate registered-provider requirement');
  expect(notes['cdl-preparation'][13].teaching).toContain('does not supply the current');
  expect(notes['electrical-foundations'][0].check).toContain('Do not perform a live test');
  expect(notes['construction-readiness'][2].check).toContain('historic PPE list');
  expect(notes['painting-drywall'][1].check).toContain('brand-specific');
  expect(notes['hvac-foundations'][10].check).toContain('Current EPA requirements');
 });
 it('maps twenty-seven uploaded sources to 405 matched lessons and clearly labels the other 69 supporting applications',()=>{
  expect(sources).toHaveLength(27);expect(Object.keys(notes)).toHaveLength(30);
  const used=new Set<string>();let direct=0,supporting=0;
  for(const course of catalog){const rows=notes[course.slug as keyof typeof notes];expect(rows).toHaveLength(course.lesson_count);
   for(const row of rows){expect(row.title).toBe(course.outline[row.number-1].title);used.add(row.sourceId);
    const source=sources.find(s=>s.id===row.sourceId)!;expect(source).toBeDefined();
    expect(row.pages.length).toBeGreaterThan(0);expect(row.pages.every(p=>Number.isInteger(p)&&p>=1&&p<=source.pageCount)).toBe(true);
    expect(row.teaching.length).toBeGreaterThan(90);expect(row.practice.length).toBeGreaterThan(65);expect(row.check.length).toBeGreaterThan(20);
    if(row.relationship==='matched-course')direct++;else {supporting++;expect(row.teaching).toContain('Supporting')}
   }
  }expect(direct).toBe(405);expect(supporting).toBe(69);expect(used.size).toBe(27);
 });
 it('adds source teaching, small written practice, and checks without changing the seven-step structure or repeating references',()=>{
  for(const lesson of lessons){const note=notes[lesson.course_slug as keyof typeof notes][lesson.number-1];const c=lesson.content;
   expect(c.pdfVersion).toBe('pdf-reading-v1');expect(c.topics[0].paragraphs).toContain('From the course reading: '+note.teaching);
   expect(c.topics[1].paragraphs).toContain('Short practice: '+note.practice);expect(c.topics[2].paragraphs).toContain('Reading check: '+note.check);
   expect(c.microlearning.chunks).toHaveLength(7);expect(c.microlearning.retrieval[0].guide).toContain(note.teaching);expect(c.questions).toHaveLength(5);
   const course=catalog.find(x=>x.slug===lesson.course_slug)!;const again=selfPacedContent(lesson as LearningLesson,course as LearningCourse);
   expect(again.topics).toEqual(c.topics);expect(again.knowledge).toEqual(c.knowledge);
   expect(c.knowledge.references.filter(r=>'pdfReading' in r&&r.pdfReading)).toHaveLength(1);
  }
 });
 it('shows uploaded-source attribution and PDF page locations without creating a broken or public PDF download link',()=>{
  const lesson=lessons.find(l=>l.course_slug==='personal-finance'&&l.number===1)!;
  const html=renderToStaticMarkup(createElement(LessonKnowledgeContent,{knowledge:lesson.content.knowledge}));
  expect(html).toContain('Reset and Rebuild');expect(html).toContain('PDF pages 11, 12');expect(html).toContain('Uploaded reading reviewed');
  expect(html).not.toContain('href=""');expect(html).not.toContain('sandbox:');expect(html).not.toContain('/upload/');
  for(const source of sources){expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);expect(source.url).toBe('');expect(source.author.length).toBeGreaterThan(8)}
 });
 it('keeps source limitations visible instead of treating an outline, historic guide, or planning aid as current authority',()=>{
  expect(sources.find(s=>s.id==='pdf-web')!.scope).toContain('preface and contents only');
  expect(sources.find(s=>s.id==='pdf-housing')!.scope).toContain('not universal');
  expect(notes['housing-stability'][1].teaching).toContain('not a universal affordability rule');
  expect(notes['personal-finance'][1].teaching).toContain('flexible guidance');
  expect(notes['thought-to-freedom'].every(n=>n.check.includes('do not clinically validate'))).toBe(true);
  expect(sources.find(s=>s.id==='pdf-stress')!.scope).toContain('No diagnostic scales');
 });
 it('includes the same reading, page references, and original practice in all thirty facilitator packs',()=>{
  for(const course of getFacilitatorCourses()){const guides=getFacilitatorGuides(course.slug),html=facilitatorCourseHTML(course,guides);
   for(const guide of guides){const note=notes[course.slug as keyof typeof notes][guide.globalLessonNumber-1];
    expect(guide.teaching[0].explanation).toContain('From the course reading: '+note.teaching);
    expect(guide.teaching[1].explanation).toContain('Short practice: '+note.practice);
    expect(guide.sources.find(s=>s.id===note.sourceId)!.note).toContain('PDF page');
   }expect(html).toContain('Uploaded reading reviewed');expect(html).not.toContain('href=""');
  }
 });
});
