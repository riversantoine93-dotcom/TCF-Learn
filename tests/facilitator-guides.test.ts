import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getFacilitatorCourses, getFacilitatorGuides } from '../lib/facilitator-guides';
import { facilitatorCourseHTML } from '../lib/facilitator-export';
import lessons from '../scripts/learning-lessons.json';

describe('facilitator guides',()=>{
  it('covers every required lesson in all 30 courses with the current teaching and assessment',()=>{
    const courses=getFacilitatorCourses();
    expect(courses).toHaveLength(30);
    let total=0;
    for(const course of courses){
      const guides=getFacilitatorGuides(course.slug);
      expect(guides).toHaveLength(course.lessonCount);
      expect(course.guideCount).toBe(course.lessonCount);
      for(const guide of guides){
        const lesson=lessons.find(l=>l.course_slug===course.slug&&l.number===guide.globalLessonNumber)!;
        expect(guide.lessonTitle).toBe(lesson.title);
        expect(guide.teaching.map(t=>({title:t.title,paragraphs:t.explanation}))).toEqual(lesson.content.topics);
        expect(guide.scenario.text).toBe(lesson.content.scenario.text);
        expect(guide.scenario.reflectionQuestions).toEqual(lesson.content.reflectionQuestions);
        expect(guide.answerKey).toHaveLength(5);
        guide.answerKey.forEach((answer,i)=>{
          const question=lesson.content.questions[i];
          expect(answer.options[answer.correctIndex]).toBe(question.options[question.correctIndex]);
          expect(answer.explanation).toBe(question.feedback);
        });
        expect(guide.runOfShow.reduce((n,s)=>n+s.minutes,0)).toBe(20);
        expect(guide.facilitatorNotes.join(' ')).toContain('any order');
        expect(guide.facilitatorNotes.join(' ')).toContain('every required lesson');
        expect(Object.values(guide.script).every(Boolean)).toBe(true);
        expect(guide.scenario.modelResponse.length).toBeGreaterThan(100);
      }
      total+=guides.length;
    }
    expect(total).toBe(474);
    expect(getFacilitatorGuides('thought-to-freedom')).toHaveLength(30);
    expect(getFacilitatorGuides('not-a-course')).toEqual([]);
  });

  it('exports a complete printable pack with protected answers and escaped content',()=>{
    const course=getFacilitatorCourses().find(c=>c.category==='trades')!;
    const guides=getFacilitatorGuides(course.slug);
    const html=facilitatorCourseHTML({...course,title:'<script>alert("x")</script>'},guides);
    expect(html.match(/<article class="lesson">/g)).toHaveLength(course.lessonCount);
    expect(html.match(/<div class="answer">/g)).toHaveLength(course.lessonCount*5);
    expect(html).toContain('window.print()');
    expect(html).toContain('authorized facilitators');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    const source=guides.flatMap(g=>g.sources)[0];
    expect(source).toBeDefined();
    expect(html).toContain(source.url.replaceAll('&','&amp;'));
  });

  it('keeps facilitator API restricted to active organization admins and course access',()=>{
    const route=readFileSync(resolve(process.cwd(),'app/api/organization/facilitator-guides/route.ts'),'utf8');
    expect(route).toContain(".eq('status','active')");
    expect(route).toContain(".in('role',['admin','co_admin'])");
    expect(route).toContain('organization_course_access');
    expect(route).toContain('Organization administrator access is required.');
    expect(route).toContain('private, no-store');
  });

  it('does not put facilitator guide content on learner course pages',()=>{
    for(const slug of ['turning-forward','thought-to-freedom']){
      const page=readFileSync(resolve(process.cwd(),`app/course/${slug}/page.tsx`),'utf8');
      expect(page).not.toContain('facilitator-guides');
    }
  });
});
