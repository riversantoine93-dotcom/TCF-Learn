import {describe,it,expect} from 'vitest';
import catalog from '../lib/learning/catalog.json';
import lessons from '../scripts/learning-lessons.json';
import {lessonIsUnlocked,validateLessonCompletion} from '../lib/learning/validation';
describe('Thirty-course learning catalog',()=>{
 it('includes CDL preparation with fifteen lessons in the thirty-course trade catalog',()=>{const course=catalog.find(c=>c.slug==='cdl-preparation');expect(course?.category).toBe('trades');expect(course?.lesson_count).toBe(15);expect(catalog.some(c=>c.slug==='warehouse-logistics')).toBe(false)});
 it('contains exactly ten courses in each requested subject area',()=>{expect(catalog).toHaveLength(30);expect(new Set(catalog.map(c=>c.slug)).size).toBe(30);for(const category of ['trades','technology','reentry'])expect(catalog.filter(c=>c.category===category)).toHaveLength(10)});
 it('has at least fifteen actual lessons per course with contiguous numbering',()=>{for(const c of catalog){const rows=lessons.filter(l=>l.course_slug===c.slug);expect(rows.length).toBe(c.lesson_count);expect(rows.length).toBeGreaterThanOrEqual(15);expect(rows.map(l=>l.number)).toEqual(Array.from({length:c.lesson_count},(_,i)=>i+1));expect(c.outline.length).toBe(rows.length)}});
 it('includes teaching, specific practice, and a valid four-option check for every new lesson',()=>{for(const row of lessons.filter(l=>!('legacy' in l.content))){const content=row.content as {teaching:string;practice:string;options:string[];correctIndex:number};expect(content.teaching.length).toBeGreaterThan(80);expect(content.practice.length).toBeGreaterThan(25);expect(content.options).toHaveLength(4);expect(new Set(content.options).size).toBe(4);expect(content.correctIndex).toBeGreaterThanOrEqual(0);expect(content.correctIndex).toBeLessThan(4)}});
 it('keeps existing course routes and identifiers',()=>{expect(catalog.find(c=>c.slug==='turning-forward')?.legacy_url).toBe('/course/turning-forward');expect(catalog.find(c=>c.slug==='thought-to-freedom')?.legacy_url).toBe('/course/thought-to-freedom')});
});
describe('Self-paced lesson completion rules',()=>{
 const questions=lessons[0].content.questions;
 const valid={reflection:'I can explain the scenario and why the observed detail changes a practical decision.',action:'I would check the missing condition and explain the next appropriate step.',answers:questions.map(q=>q.correctIndex)};
 it('allows valid lessons in any order regardless of prior completion',()=>{expect(lessonIsUnlocked(1,[])).toBe(true);expect(lessonIsUnlocked(15,[])).toBe(true);expect(lessonIsUnlocked(3,[1])).toBe(true);expect(lessonIsUnlocked(0,[])).toBe(false)});
 it('rejects an incomplete quiz, whitespace reflection, and insufficient scenario response',()=>{expect(validateLessonCompletion({...valid,answers:valid.answers.slice(0,4)},questions)).toMatch(/knowledge-check/);expect(validateLessonCompletion({...valid,reflection:' '.repeat(60)},questions)).toMatch(/reflection/);expect(validateLessonCompletion({...valid,action:'Done'},questions)).toMatch(/scenario/)});
 it('accepts sufficient scenario responses and five correct answers',()=>expect(validateLessonCompletion(valid,questions)).toBeNull());
});
