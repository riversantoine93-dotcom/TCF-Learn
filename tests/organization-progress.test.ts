import { describe, expect, it } from "vitest";
import {
  summarizeLearnerProgress,
  summarizeThoughtToFreedom,
  summarizeTurningForward,
} from "../lib/organization-progress";

describe("organization progress summaries",()=>{
  it("tracks 32 Turning Forward completion points",()=>{
    const summary=summarizeTurningForward();
    expect(summary.total).toBe(32);
    expect(summary.completed).toBe(0);
    expect(summary.percent).toBe(0);
    expect(summary.status).toBe("not_started");
  });

  it("tracks 31 Thought to Freedom completion points",()=>{
    const summary=summarizeThoughtToFreedom();
    expect(summary.total).toBe(31);
    expect(summary.completed).toBe(0);
    expect(summary.percent).toBe(0);
    expect(summary.status).toBe("not_started");
  });

  it("combines both courses into 63 required completion points",()=>{
    const summary=summarizeLearnerProgress("user-1",[]);
    expect(summary.total).toBe(63);
    expect(summary.completed).toBe(0);
    expect(summary.status).toBe("not_started");
  });

  it("marks completed lessons and only the next item as in progress",()=>{
    const summary=summarizeTurningForward({
      user_id:"user-1",
      course_slug:"turning-forward",
      progress:{
        m1opener:true,
        lesson1:true,
        lesson2:true,
        lesson3:true,
        challenge:true,
        m2opener:true,
      },
      updated_at:"2026-09-21T20:00:00.000Z",
    });

    expect(summary.completed).toBe(4);
    expect(summary.percent).toBe(13);
    expect(summary.modules[0].items.every(item=>item.status==="complete")).toBe(true);
    expect(summary.modules[1].items[0].status).toBe("in_progress");
    expect(summary.modules[1].items[1].status).toBe("not_started");
    expect(summary.currentItem).toBe("Module 2: Lesson 1");
  });

  it("recognizes a fully completed Thought to Freedom course",()=>{
    const progress:Record<string,boolean>={m0lesson0:true,orientationComplete:true};
    for(let module=1;module<=10;module+=1){
      for(let lesson=1;lesson<=3;lesson+=1)progress[`m${module}lesson${lesson}`]=true;
    }
    const summary=summarizeThoughtToFreedom({
      user_id:"user-2",
      course_slug:"thought-to-freedom",
      progress,
      updated_at:"2026-09-21T20:05:00.000Z",
    });

    expect(summary.completed).toBe(31);
    expect(summary.percent).toBe(100);
    expect(summary.status).toBe("complete");
    expect(summary.currentItem).toBeNull();
  });
});
