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
  courseSlug: "turning-forward" | "thought-to-freedom";
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
