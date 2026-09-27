import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getFacilitatorGuides } from "../lib/facilitator-guides";

describe("facilitator guides",()=>{
  it("covers all Turning Forward lessons",()=>{
    const guides=getFacilitatorGuides("turning-forward");
    expect(guides).toHaveLength(24);
    expect(guides[0].lessonTitle).toBe("You Are Not Starting Over");
    expect(guides[23].moduleNumber).toBe(8);
    expect(guides.every(guide=>guide.overview&&guide.facilitationGoal)).toBe(true);
    expect(guides.every(guide=>guide.discussionPoints.length>=3)).toBe(true);
    expect(guides.every(guide=>guide.script.opening&&guide.script.teaching&&guide.script.discussion&&guide.script.activity&&guide.script.closing)).toBe(true);
  });

  it("covers Thought to Freedom orientation plus all 30 lessons",()=>{
    const guides=getFacilitatorGuides("thought-to-freedom");
    expect(guides).toHaveLength(31);
    expect(guides[0].moduleNumber).toBe(0);
    expect(guides[0].lessonTitle).toBe("Before the Action Comes the Thought");
    expect(guides.filter(guide=>guide.moduleNumber>0)).toHaveLength(30);
  });

  it("keeps facilitator API restricted to active admins and co-admins",()=>{
    const route=readFileSync(resolve(process.cwd(),"app/api/organization/facilitator-guides/route.ts"),"utf8");
    expect(route).toContain('.eq("status","active")');
    expect(route).toContain('.in("role",["admin","co_admin"])');
    expect(route).toContain("Organization administrator access is required.");
  });

  it("does not put facilitator guide content on learner course pages",()=>{
    const turningPage=readFileSync(resolve(process.cwd(),"app/course/turning-forward/page.tsx"),"utf8");
    const thoughtPage=readFileSync(resolve(process.cwd(),"app/course/thought-to-freedom/page.tsx"),"utf8");
    expect(turningPage).not.toContain("facilitator-guides");
    expect(thoughtPage).not.toContain("facilitator-guides");
  });
});
