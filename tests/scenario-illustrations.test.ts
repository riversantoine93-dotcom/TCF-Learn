import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import catalog from '../lib/learning/catalog.json';
import lessons from '../scripts/learning-lessons.json';
import {artwork,scenarioVisual,type IllustrationKind} from '../lib/learning/scenario-illustrations';
import {scenarioSVG} from '../lib/learning/illustration-art';
import ScenarioIllustration from '../components/ScenarioIllustration';
import {getFacilitatorCourses,getFacilitatorGuides} from '../lib/facilitator-guides';
import {facilitatorCourseHTML} from '../lib/facilitator-export';
describe('Original CC0 scenario illustrations',()=>{
 it('maps all 474 lessons to existing relevant artwork with descriptive alternatives and license information',()=>{
  let count=0;for(const course of catalog)for(const lesson of course.outline){const visual=scenarioVisual(course.slug,lesson.number)!;count++;
   expect(visual).toBeTruthy();expect(visual.alt.length).toBeGreaterThan(70);expect(visual.caption.length).toBeGreaterThan(50);expect(visual.license).toBe('CC0-1.0');expect(visual.licenseUrl).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
   expect(readFileSync('public'+visual.src,'utf8')).toBe(scenarioSVG(visual.kind)+'\n');
  }expect(count).toBe(474);expect(Object.keys(artwork)).toHaveLength(50);
  expect(scenarioVisual('unknown',1)).toBeNull();expect(scenarioVisual('cdl-preparation',0)).toBeNull();
 });
 it('uses deterministic self-contained vectors without external assets or executable SVG content',()=>{
  for(const kind of Object.keys(artwork) as IllustrationKind[]){const svg=scenarioSVG(kind);expect(svg).toContain('viewBox="0 0 960 540"');expect(svg).toContain('<title>');expect(svg).toContain('<desc>');expect(svg).toContain('CC0-1.0');expect(svg).not.toMatch(/<script|<foreignObject|<image|onload=|onclick=|javascript:|href=/i)}
 });
 it('matches the CDL damaged-tire and unsecured-item scenario instead of referring to a missing photograph',()=>{
  const visual=scenarioVisual('cdl-preparation',4)!;expect(visual.kind).toBe('vehicle-inspection');expect(visual.alt).toContain('visible sidewall cut');expect(visual.alt).toContain('loose box');expect(visual.caption).toContain('cannot establish');
  const lesson=lessons.find(l=>l.course_slug==='cdl-preparation'&&l.number===4)!;expect(lesson.content.scenario.text).toContain('The illustration shows a damaged tire and an unsecured item.');expect(lesson.content.scenario.text).not.toContain('A photo shows');
 });
 it('provides accessible lazy-loaded figures with captions and an optional full-size view',()=>{
  const html=renderToStaticMarkup(createElement(ScenarioIllustration,{slug:'cdl-preparation',number:4}));expect(html).toContain('<figure');expect(html).toContain('<figcaption');expect(html).toContain('loading="lazy"');expect(html).toContain('width="960"');expect(html).toContain('alt="Two inspection observations');expect(html).toContain('View full-size illustration');expect(html).toContain('/illustrations/LICENSE.txt');
 });
 it('embeds an offline illustration for every facilitator lesson without fetching remote images',()=>{
  for(const course of getFacilitatorCourses()){const guides=getFacilitatorGuides(course.slug),html=facilitatorCourseHTML(course,guides);expect(html.match(/<figure>/g)).toHaveLength(course.lessonCount);expect(html.match(/<svg /g)).toHaveLength(course.lessonCount);expect(html).not.toContain('<img ');expect(html).toContain('Original illustration:');for(const guide of guides)expect(guide.visual?.kind).toBe(scenarioVisual(course.slug,guide.globalLessonNumber)?.kind)}
 });
 it('limits the public-domain dedication to the original artwork',()=>{
  const license=readFileSync('public/illustrations/LICENSE.txt','utf8');expect(license).toContain('CC0 1.0');expect(license).toContain('It does not apply to TCF logos');expect(license).toContain('No third-party stock images');
 });
});
