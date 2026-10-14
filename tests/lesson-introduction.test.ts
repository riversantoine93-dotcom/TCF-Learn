import { describe, it, expect } from 'vitest';
import lessons from '../scripts/learning-lessons.json';
import { moduleContent } from '../lib/course-content';
import { moduleOneContent } from '../lib/module-one-content';
import { thoughtToFreedomCourse } from '../lib/courses/thought-to-freedom';
import { learningIntroduction, turningForwardIntroduction, thoughtIntroduction } from '../lib/lesson-introduction';
import type { LearningContent } from '../lib/learning/types';

describe('Lesson introductions across the full catalog', () => {
  it('provides an overview, learning outcomes and a reason for every lesson and orientation', () => {
    const introductions = [
      ...lessons.filter(l => !('legacy' in l.content)).map(l => learningIntroduction(l.title, l.content as LearningContent)),
      ...[moduleOneContent, ...moduleContent].flatMap(m => m.lessons.map(turningForwardIntroduction)),
      ...thoughtToFreedomCourse.modules.flatMap(m => m.lessons.map(l => thoughtIntroduction(l, m))),
      thoughtIntroduction(thoughtToFreedomCourse.orientation!),
    ];
    expect(introductions).toHaveLength(lessons.length + 1);
    for (const intro of introductions) {
      expect(intro.overview.length).toBeGreaterThan(30);
      expect(intro.outcomes.length).toBeGreaterThanOrEqual(2);
      expect(intro.outcomes.every(s => s.trim().length > 5)).toBe(true);
      expect(intro.why.length).toBeGreaterThan(30);
      expect(JSON.stringify(intro)).not.toMatch(/undefined|\[object Object\]/);
    }
  });
  it('uses each digital lesson’s specific teaching, objective and practice', () => {
    const row = lessons.find(l => l.course_slug === 'digital-literacy' && l.number === 1)!;
    const content = row.content as LearningContent;
    const intro = learningIntroduction(row.title, content);
    expect(intro.overview).toContain('device vocabulary');
    expect(intro.outcomes).toEqual(content.topics!.map(t=>t.title));
    expect(content.topics!.every(t=>t.paragraphs.length>=2)).toBe(true);
    expect(intro.why).toContain('describe a problem accurately');
  });
  it('keeps thought correction introductions specific to their module', () => {
    const [first, second] = thoughtToFreedomCourse.modules;
    expect(thoughtIntroduction(first.lessons[1], first).why).not.toEqual(thoughtIntroduction(second.lessons[1], second).why);
  });
});
