import catalog from "./learning/catalog.json";
import { modules as turningForwardModules } from "./course";
import { thoughtToFreedomCourse } from "./courses/thought-to-freedom";

export type ProgressItemStatus = "complete" | "in_progress" | "not_started";

export type ProgressItemSummary = {
  key: string;
  label: string;
  status: ProgressItemStatus;
};

export type ProgressModuleSummary = {
  number: number;
  title: string;
  completed: number;
  total: number;
  introWatched?: boolean;
  items: ProgressItemSummary[];
};

export type ProgressCourseSummary = {
  courseSlug: string;
  title: string;
  completed: number;
  total: number;
  percent: number;
  status: ProgressItemStatus;
  currentItem: string | null;
  lastActivity: string | null;
  modules: ProgressModuleSummary[];
};

export type LearnerProgressSummary = {
  userId: string;
  completed: number;
  total: number;
  percent: number;
  status: ProgressItemStatus;
  lastActivity: string | null;
  courses: ProgressCourseSummary[];
};

type ProgressRow = {
  user_id: string;
  course_slug: string;
  progress: Record<string, unknown> | null;
  updated_at: string | null;
};

function baseStatus(complete: boolean): ProgressItemStatus {
  return complete ? "complete" : "not_started";
}

function markCurrentItem(modules: ProgressModuleSummary[], currentKey: string | null, hasActivity: boolean) {
  if (!hasActivity || !currentKey) return modules;
  return modules.map((module) => ({
    ...module,
    items: module.items.map((item) => item.key === currentKey && item.status !== "complete"
      ? { ...item, status: "in_progress" as const }
      : item),
  }));
}

function buildCourseStatus(completed: number, total: number, hasActivity: boolean): ProgressItemStatus {
  if (completed >= total && total > 0) return "complete";
  if (hasActivity || completed > 0) return "in_progress";
  return "not_started";
}

function pct(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0;
}

export function summarizeTurningForward(row?: ProgressRow): ProgressCourseSummary {
  const progress = row?.progress || {};
  const hasActivity = Object.keys(progress).length > 0;
  const flatItems: { key: string; label: string; complete: boolean }[] = [];

  let modules: ProgressModuleSummary[] = turningForwardModules.map((module) => {
    const items = [
      ...[1, 2, 3].map((lessonNumber) => {
        const key = module.number === 1 ? `lesson${lessonNumber}` : `m${module.number}lesson${lessonNumber}`;
        return { key, label: `Lesson ${lessonNumber}`, complete: Boolean(progress[key]) };
      }),
      {
        key: module.number === 1 ? "challenge" : `m${module.number}challenge`,
        label: "Forward Challenge",
        complete: Boolean(progress[module.number === 1 ? "challenge" : `m${module.number}challenge`]),
      },
    ];

    flatItems.push(...items.map((item) => ({ ...item, label: `Module ${module.number}: ${item.label}` })));

    return {
      number: module.number,
      title: module.title,
      completed: items.filter((item) => item.complete).length,
      total: items.length,
      introWatched: Boolean(progress[`m${module.number}opener`]),
      items: items.map((item) => ({ key: item.key, label: item.label, status: baseStatus(item.complete) })),
    };
  });

  const completed = flatItems.filter((item) => item.complete).length;
  const total = flatItems.length;
  const firstOpen = flatItems.find((item) => !item.complete) || null;
  modules = markCurrentItem(modules, firstOpen?.key || null, hasActivity);

  return {
    courseSlug: "turning-forward",
    title: "Turning Forward",
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, hasActivity),
    currentItem: firstOpen?.label || null,
    lastActivity: row?.updated_at || null,
    modules,
  };
}

export function summarizeThoughtToFreedom(row?: ProgressRow): ProgressCourseSummary {
  const progress = row?.progress || {};
  const hasActivity = Object.keys(progress).length > 0;
  const orientation = {
    key: "m0lesson0",
    label: "Course Orientation",
    complete: Boolean(progress.m0lesson0 || progress.orientationComplete),
  };

  const flatItems: { key: string; label: string; complete: boolean }[] = [orientation];

  let modules: ProgressModuleSummary[] = [
    {
      number: 0,
      title: "Orientation",
      completed: orientation.complete ? 1 : 0,
      total: 1,
      items: [{ key: orientation.key, label: orientation.label, status: baseStatus(orientation.complete) }],
    },
    ...thoughtToFreedomCourse.modules.map((module) => {
      const items = module.lessons.map((lesson) => {
        const key = `m${module.number}lesson${lesson.number}`;
        return { key, label: `Lesson ${lesson.number}: ${lesson.title}`, complete: Boolean(progress[key]) };
      });

      flatItems.push(...items.map((item) => ({ ...item, label: `Module ${module.number}: ${item.label}` })));

      return {
        number: module.number,
        title: module.title,
        completed: items.filter((item) => item.complete).length,
        total: items.length,
        items: items.map((item) => ({ key: item.key, label: item.label, status: baseStatus(item.complete) })),
      };
    }),
  ];

  const completed = flatItems.filter((item) => item.complete).length;
  const total = flatItems.length;
  const firstOpen = flatItems.find((item) => !item.complete) || null;
  modules = markCurrentItem(modules, firstOpen?.key || null, hasActivity);

  return {
    courseSlug: "thought-to-freedom",
    title: "Thought to Freedom",
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, hasActivity),
    currentItem: firstOpen?.label || null,
    lastActivity: row?.updated_at || null,
    modules,
  };
}

export function summarizeLearnerProgress(userId: string, rows: ProgressRow[]): LearnerProgressSummary {
  const turningRow = rows.find((row) => row.course_slug === "turning-forward");
  const thoughtRow = rows.find((row) => row.course_slug === "thought-to-freedom");
  const courses = [summarizeTurningForward(turningRow), summarizeThoughtToFreedom(thoughtRow)];
  const completed = courses.reduce((sum, course) => sum + course.completed, 0);
  const total = courses.reduce((sum, course) => sum + course.total, 0);
  const activityDates = courses.map((course) => course.lastActivity).filter(Boolean) as string[];
  const lastActivity = activityDates.sort((a, b) => Date.parse(b) - Date.parse(a))[0] || null;

  return {
    userId,
    completed,
    total,
    percent: pct(completed, total),
    status: buildCourseStatus(completed, total, Boolean(lastActivity)),
    lastActivity,
    courses,
  };
}

export function summarizeCatalogProgress(userId:string,modern:{user_id:string;course_slug:string;lesson_number:number;updated_at?:string|null}[],historical:{user_id:string;course_slug:string;lesson_number:number}[]):LearnerProgressSummary {
 const completedRows=[...modern.filter(r=>r.user_id===userId),...historical.filter(r=>r.user_id===userId)];
 const courses:ProgressCourseSummary[]=catalog.map(c=>{
  const done=new Set(completedRows.filter(r=>r.course_slug===c.slug).map(r=>r.lesson_number));
  const groupSize=c.legacy_url?3:c.lesson_count;
  const modules:ProgressModuleSummary[]=Array.from({length:Math.ceil(c.lesson_count/groupSize)},(_,index)=>{
   const items=c.outline.slice(index*groupSize,(index+1)*groupSize).map(l=>({key:`${c.slug}:lesson${l.number}`,label:`Lesson ${l.number}: ${l.title}`,status:done.has(l.number)?'complete' as const:'not_started' as const}));
   return {number:index+1,title:c.legacy_url?`Module ${index+1}`:'Course lessons',completed:items.filter(i=>i.status==='complete').length,total:items.length,items};
  });
  const completed=c.outline.filter(l=>done.has(l.number)).length;
  const dates=modern.filter(r=>r.user_id===userId&&r.course_slug===c.slug&&r.updated_at).map(r=>r.updated_at!).sort();
  return {courseSlug:c.slug,title:c.title,completed,total:c.lesson_count,percent:Math.round(completed/c.lesson_count*100),status:completed===c.lesson_count?'complete':completed?'in_progress':'not_started',currentItem:c.outline.find(l=>!done.has(l.number))?.title||null,lastActivity:dates.at(-1)||null,modules};
 });
 const completed=courses.reduce((n,c)=>n+c.completed,0),total=courses.reduce((n,c)=>n+c.total,0);
 return {userId,completed,total,percent:Math.round(completed/total*100),status:completed===total?'complete':completed?'in_progress':'not_started',lastActivity:courses.map(c=>c.lastActivity).filter((d):d is string=>Boolean(d)).sort().at(-1)||null,courses};
}
