import {describe,it,expect} from 'vitest';
import lessons from '../scripts/learning-lessons.json';
import {knowledgeSources} from '../lib/knowledge-sources';
import {getLegacyKnowledge} from '../lib/legacy-knowledge';
import type {LessonKnowledge} from '../lib/lesson-knowledge';
import catalog from '../lib/learning/catalog.json';
describe('Practical key-idea content',()=>{
 it('has a distinct worked scenario and practical guidance for every lesson',()=>{
   expect(lessons).toHaveLength(474);
   const scenarios=new Set<string>();
   for(const row of lessons){const k=row.content.knowledge as LessonKnowledge;expect(k.example.length).toBeGreaterThan(70);scenarios.add(k.example);expect(k.tips.every(t=>t.length>35)).toBe(true);for(const r of k.references){expect(knowledgeSources[r.sourceId]).toBeDefined();expect(r.note.length).toBeGreaterThan(60)}}
   expect(scenarios.size).toBe(474);
 });
 it('includes soft skills, specific focus points, and optional resets in all reentry lessons',()=>{
   const reentry=new Set(catalog.filter(c=>c.category==='reentry').map(c=>c.slug));
   for(const row of lessons.filter(l=>reentry.has(l.course_slug))){const k=row.content.knowledge as LessonKnowledge;expect(k.softSkill?.length).toBeGreaterThan(3);expect(k.focus?.length).toBeGreaterThan(35);expect(k.reset).toMatch(/comfortable|optional|safe/)}
 });
 it('resolves every legacy lesson through its unchanged module and lesson number',()=>{
   for(const row of lessons.filter(l=>'legacy' in l.content))expect(getLegacyKnowledge(row.course_slug as 'turning-forward'|'thought-to-freedom',Math.floor((row.number-1)/3)+1,(row.number-1)%3+1)).toEqual(row.content.knowledge);
   expect(getLegacyKnowledge('thought-to-freedom',0,0).softSkill).toBe('Self-awareness');
 });
 it('keeps regulations distinct from guidance and technical references',()=>{
   expect(knowledgeSources['fmcsa-hos'].kind).toBe('Regulation');expect(knowledgeSources['nist-ai'].kind).toBe('Guidance');expect(knowledgeSources['wcag-contrast'].kind).toBe('Technical reference');
   for(const s of Object.values(knowledgeSources)){if(s.uploadedFile){expect(s.url).toBe('');expect(s.scope!.length).toBeGreaterThan(60)}else expect(s.url).toMatch(/^https:\/\//);expect(s.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(Number.isNaN(Date.parse(s.checked))).toBe(false)}
 });
 it('includes applicable CDL, refrigerant, and accessibility facts with sources',()=>{
   const cdl=lessons.find(l=>l.course_slug==='cdl-preparation'&&l.number===14)!;expect(cdl.content.knowledge.references.some(r=>r.sourceId==='fmcsa-hos')).toBe(true);
   const hvac=lessons.find(l=>l.course_slug==='hvac-foundations'&&l.number===11)!;expect(hvac.content.knowledge.references.some(r=>r.sourceId==='epa-608')).toBe(true);
   const web=lessons.find(l=>l.course_slug==='web-design'&&l.number===8)!;expect(web.content.knowledge.example).toContain('4.5:1');
 });
});
