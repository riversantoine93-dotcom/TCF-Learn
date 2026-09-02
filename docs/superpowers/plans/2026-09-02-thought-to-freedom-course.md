# Thought to Freedom Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Thought to Freedom: Correcting Criminal Thinking Errors as a complete second course inside TCF Learn without regressing Turning Forward.

**Architecture:** Extend the existing Next.js 16 App Router application into a reusable multi-course platform. Preserve the current Turning Forward routes and Supabase user model, make progress helpers course-aware, add a typed Thought to Freedom content source, render the 10-module/30-lesson curriculum through shared course components, and expose the course through the existing dashboard and Vercel deployment.

**Tech Stack:** Next.js 16.3.3, React 19.2.8, TypeScript 5.9.2, Supabase JS 2.57+, CSS, Vercel, GitHub.

**Spec:** `docs/superpowers/specs/2026-09-02-thought-to-freedom-course-design.md`

## Global Constraints

- Preserve all current Turning Forward routes and saved progress.
- Use the existing Supabase authentication model; do not create a second login system.
- Use explicit course identifiers so Turning Forward and Thought to Freedom progress cannot collide.
- Thought to Freedom contains one orientation plus 10 modules × 3 lessons = 30 core lessons.
- Modules remain sequential: Lesson 3 completion unlocks the next module.
- Required reflection responses must be completed before lesson completion.
- No multiple-choice answer may be preselected.
- Incorrect knowledge-check answers must receive explanatory feedback.
- Maintain TCF Learn black/cream/gold brand language and light/dark readability.
- Do not use prison bars, mugshots, handcuffs, or stereotypical criminal-justice imagery.
- Preserve workbook terminology and chapter organization; do not attribute newly written instructional copy to Samenow or Yochelson.
- Node runtime remains `22.x` and current Next.js/React versions remain unchanged unless a required compatibility fix proves necessary.

---

## File Structure

### Create
- `lib/courses/types.ts` — reusable course/module/lesson/content-block contracts.
- `lib/courses/registry.ts` — stable course registry and lookup helpers.
- `lib/courses/thought-to-freedom.ts` — complete orientation, module metadata, 30 lesson definitions, workbook activities, case studies, and final action-plan schema.
- `components/course/InteractiveLesson.tsx` — generic lesson interaction shell.
- `components/course/CatchTheThought.tsx` — thinking-error identification/replacement interaction.
- `components/course/DecisionPointCard.tsx` — scenario decision component.
- `components/course/WorkbookActivity.tsx` — reusable structured workbook activity renderer.
- `components/course/ActionPlanBuilder.tsx` — final Thought to Freedom action-plan form.
- `app/course/thought-to-freedom/page.tsx` — course overview.
- `app/course/thought-to-freedom/[module]/page.tsx` — module/lesson experience.
- `app/course/thought-to-freedom/completion/page.tsx` — final action-plan/completion page.
- `app/course/thought-to-freedom/thought-to-freedom.css` — course-specific visual treatment.
- `tests/course-registry.test.ts` — course structure and lookup tests.
- `tests/progress.test.ts` — course-isolated progress tests.
- `tests/thought-to-freedom-content.test.ts` — content completeness and sequential-order tests.

### Modify
- `lib/course.ts` — keep legacy Turning Forward export compatibility while exposing it through the registry.
- `lib/progress.ts` — make local/cloud progress helpers course-aware while defaulting legacy calls to `turning-forward`.
- `app/dashboard/page.tsx` — render Thought to Freedom as the second course and preserve existing enrollment/progress visibility rules.
- `app/dashboard/dashboard.css` — support the second course card and course-state badges responsively.
- `app/course-layout.css` — add generic shared lesson states only when needed by both courses.
- `package.json` — add a lightweight test runner and `test` script while leaving runtime dependencies unchanged.

---

### Task 1: Establish the Multi-Course Contracts and Registry

**Files:**
- Create: `lib/courses/types.ts`
- Create: `lib/courses/registry.ts`
- Modify: `lib/course.ts`
- Create: `tests/course-registry.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `CourseDefinition`, `CourseModule`, `CourseLesson`, `ContentBlock`, `QuestionDefinition`.
- Produces `COURSE_SLUGS`, `getCourseDefinition(slug)`, `getCourseModule(courseSlug, moduleSlug)`, `getCourseLesson(courseSlug, moduleSlug, lessonSlug)`.
- Preserves the current `modules` export from `lib/course.ts` for Turning Forward callers.

- [ ] **Step 1: Add Vitest and test scripts to the existing package.**

Add to `devDependencies`:

```json
"vitest": "^3.2.4"
```

Add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Run:

```bash
yarn install
```

Expected: lockfile updates successfully without changing Next.js, React, or Supabase versions.

- [ ] **Step 2: Write the failing registry test.**

```ts
import { describe, expect, it } from "vitest";
import { COURSE_SLUGS, getCourseDefinition } from "../lib/courses/registry";

describe("course registry", () => {
  it("contains stable slugs for both TCF Learn courses", () => {
    expect(COURSE_SLUGS).toEqual(["turning-forward", "thought-to-freedom"]);
  });

  it("returns no course for an unknown slug", () => {
    expect(getCourseDefinition("does-not-exist")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run the test and verify failure.**

Run:

```bash
yarn test tests/course-registry.test.ts
```

Expected: FAIL because `lib/courses/registry.ts` does not exist.

- [ ] **Step 4: Implement the shared contracts.**

Create `lib/courses/types.ts` with focused contracts:

```ts
export type CourseSlug = "turning-forward" | "thought-to-freedom";

export type QuestionOption = {
  id: string;
  label: string;
  correct?: boolean;
  feedback: string;
};

export type QuestionDefinition = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "key-idea"; text: string }
  | { type: "reflection"; id: string; prompt: string; minChars: number }
  | { type: "knowledge-check"; question: QuestionDefinition }
  | { type: "catch-the-thought"; id: string; prompt: string; statements: string[] }
  | { type: "decision-point"; id: string; scenario: string; prompt: string }
  | { type: "workbook-activity"; id: string; title: string; instructions: string; fields: string[] };

export type CourseLesson = {
  slug: string;
  number: number;
  title: string;
  objective: string;
  blocks: ContentBlock[];
};

export type CourseModule = {
  slug: string;
  number: number;
  title: string;
  coreQuestion: string;
  keyIdea: string;
  lessons: CourseLesson[];
};

export type CourseDefinition = {
  slug: CourseSlug;
  title: string;
  subtitle: string;
  description: string;
  orientation?: CourseLesson;
  modules: CourseModule[];
};
```

- [ ] **Step 5: Implement registry lookup with legacy Turning Forward compatibility.**

`registry.ts` should export exact stable slugs and initially register Turning Forward metadata converted from the existing `modules` array. `lib/course.ts` must continue exporting `modules` unchanged so existing code does not break.

```ts
export const COURSE_SLUGS = ["turning-forward", "thought-to-freedom"] as const;

export function getCourseDefinition(slug: string) {
  return courseRegistry.find((course) => course.slug === slug);
}
```

- [ ] **Step 6: Run registry tests and production build.**

```bash
yarn test tests/course-registry.test.ts
yarn build
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add package.json yarn.lock lib/course.ts lib/courses tests/course-registry.test.ts
git commit -m "feat: add multi-course registry"
```

---

### Task 2: Make Progress Storage Course-Aware Without Breaking Turning Forward

**Files:**
- Modify: `lib/progress.ts`
- Create: `tests/progress.test.ts`

**Interfaces:**
- Produces `loadLocalProgress(courseSlug?: CourseSlug): ProgressData`.
- Produces `saveLocalProgress(data, courseSlug?: CourseSlug): void`.
- Produces `loadCloudProgress(userId, courseSlug?: CourseSlug): Promise<ProgressData>`.
- Produces `saveCloudProgress(userId, progress, courseSlug?: CourseSlug): Promise<void>`.
- Default `courseSlug` is always `turning-forward` so existing callers remain valid.

- [ ] **Step 1: Write the failing local-storage key test.**

```ts
import { describe, expect, it } from "vitest";
import { progressStorageKey } from "../lib/progress";

describe("course progress isolation", () => {
  it("keeps the legacy Turning Forward key", () => {
    expect(progressStorageKey("turning-forward")).toBe("turning-forward-progress");
  });

  it("uses a distinct Thought to Freedom key", () => {
    expect(progressStorageKey("thought-to-freedom")).toBe("thought-to-freedom-progress");
  });
});
```

- [ ] **Step 2: Run and confirm failure.**

```bash
yarn test tests/progress.test.ts
```

Expected: FAIL because `progressStorageKey` is not exported.

- [ ] **Step 3: Implement course-aware progress helpers.**

```ts
export function progressStorageKey(courseSlug: CourseSlug = "turning-forward") {
  return `${courseSlug}-progress`;
}

export function loadLocalProgress(courseSlug: CourseSlug = "turning-forward"): ProgressData { /* current logic with progressStorageKey */ }
export function saveLocalProgress(data: ProgressData, courseSlug: CourseSlug = "turning-forward") { /* current logic */ }
export async function loadCloudProgress(userId: string, courseSlug: CourseSlug = "turning-forward"): Promise<ProgressData> { /* filter user_id + course_slug */ }
export async function saveCloudProgress(userId: string, progress: ProgressData, courseSlug: CourseSlug = "turning-forward") { /* upsert user_id + course_slug */ }
```

Cloud reads must use both columns:

```ts
.eq("user_id", userId)
.eq("course_slug", courseSlug)
.maybeSingle();
```

- [ ] **Step 4: Run tests and build.**

```bash
yarn test tests/progress.test.ts
yarn build
```

Expected: PASS; current Turning Forward callers compile unchanged.

- [ ] **Step 5: Commit.**

```bash
git add lib/progress.ts tests/progress.test.ts
git commit -m "feat: isolate progress by course"
```

---

### Task 3: Encode the Thought to Freedom Curriculum

**Files:**
- Create: `lib/courses/thought-to-freedom.ts`
- Modify: `lib/courses/registry.ts`
- Create: `tests/thought-to-freedom-content.test.ts`

**Interfaces:**
- Produces `thoughtToFreedomCourse: CourseDefinition`.
- The registry returns it for `thought-to-freedom`.
- Exact module order: Closed Channel; Viewing Self as a Good Person; Victimstance; Lack of Effort; Lack of Interest in Responsible Performance; Ownership Attitude; Fear of Fear; Lack of Time Perspective; Power Thrust; Uniqueness.

- [ ] **Step 1: Write failing structural tests.**

```ts
import { describe, expect, it } from "vitest";
import { thoughtToFreedomCourse } from "../lib/courses/thought-to-freedom";

const expectedTitles = [
  "The Closed Channel",
  "Viewing Self as a Good Person",
  "Victimstance",
  "Lack of Effort",
  "Lack of Interest in Responsible Performance",
  "Ownership Attitude",
  "Fear of Fear",
  "Lack of Time Perspective",
  "Power Thrust",
  "Uniqueness",
];

describe("Thought to Freedom curriculum", () => {
  it("contains one orientation, ten modules, and thirty lessons", () => {
    expect(thoughtToFreedomCourse.orientation?.title).toBe("Before the Action Comes the Thought");
    expect(thoughtToFreedomCourse.modules).toHaveLength(10);
    expect(thoughtToFreedomCourse.modules.flatMap((m) => m.lessons)).toHaveLength(30);
  });

  it("preserves workbook chapter order", () => {
    expect(thoughtToFreedomCourse.modules.map((m) => m.title)).toEqual(expectedTitles);
  });

  it("gives every module three lessons and a core question", () => {
    for (const module of thoughtToFreedomCourse.modules) {
      expect(module.lessons).toHaveLength(3);
      expect(module.coreQuestion.length).toBeGreaterThan(10);
    }
  });
});
```

- [ ] **Step 2: Run and confirm failure.**

```bash
yarn test tests/thought-to-freedom-content.test.ts
```

- [ ] **Step 3: Implement course metadata and orientation.**

Use the approved copy exactly for title/subtitle/supporting line. Orientation must teach the Thought → Choice → Action → Consequence chain and the Recognize → Examine → Interrupt → Replace → Practice loop.

- [ ] **Step 4: Encode all ten workbook modules and three-lesson pattern.**

For every module:
- Lesson 1 title: `Recognize It`
- Lesson 2 title: `Catch It in Real Life`
- Lesson 3 title: `Correct the Thought`

Use workbook-derived cases and exercises in the matching chapter only. Preserve Lisa and the Counselor under Closed Channel, James and the Parole Officer under Victimstance, Kevin's Job Interview under Fear of Fear, and Malik and the Group Discussion under Power Thrust.

- [ ] **Step 5: Add at least one required reflection and one knowledge check per core lesson.**

Every reflection block uses `minChars: 50`. Every knowledge check has exactly one `correct: true` option and explicit feedback for every option.

- [ ] **Step 6: Register the new course and rerun tests.**

```bash
yarn test tests/thought-to-freedom-content.test.ts tests/course-registry.test.ts
yarn build
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add lib/courses/registry.ts lib/courses/thought-to-freedom.ts tests/thought-to-freedom-content.test.ts
git commit -m "feat: add Thought to Freedom curriculum"
```

---

### Task 4: Build Reusable Interactive Lesson Components

**Files:**
- Create: `components/course/InteractiveLesson.tsx`
- Create: `components/course/CatchTheThought.tsx`
- Create: `components/course/DecisionPointCard.tsx`
- Create: `components/course/WorkbookActivity.tsx`
- Modify: `app/course-layout.css`

**Interfaces:**
- `InteractiveLesson` consumes `{ courseSlug, moduleSlug, lesson, progress, onProgressChange, onComplete }`.
- `CatchTheThought` consumes one `catch-the-thought` block and returns saved answers through a callback.
- `WorkbookActivity` stores each configured field under stable block/field keys.

- [ ] **Step 1: Implement the lesson renderer as a client component with no default quiz selection.**

The renderer switches on `block.type`, renders controlled responses, and derives completion validity from all required reflections/activities plus knowledge checks.

- [ ] **Step 2: Implement incorrect-answer feedback without auto-completing the question.**

Selecting an option displays `option.feedback`; the correct state is explicit text/icon plus color, not color alone.

- [ ] **Step 3: Implement the workbook interaction components.**

`CatchTheThought` must support an old thought and replacement thought. `DecisionPointCard` must show the scenario before the prompt. `WorkbookActivity` must render its field labels from curriculum data rather than hard-coded chapter names.

- [ ] **Step 4: Add accessible shared styles.**

Include visible focus states, 44px minimum touch targets, stacked mobile layouts, explicit `.is-correct`, `.is-incorrect`, `.is-locked`, and `.is-complete` text/icon treatment.

- [ ] **Step 5: Build and manually smoke-test using an isolated component route or the first Thought to Freedom lesson once Task 5 exists.**

```bash
yarn build
```

Expected: no TypeScript or Next.js errors.

- [ ] **Step 6: Commit.**

```bash
git add components/course app/course-layout.css
git commit -m "feat: add interactive course components"
```

---

### Task 5: Add Thought to Freedom Overview and Sequential Lesson Routes

**Files:**
- Create: `app/course/thought-to-freedom/page.tsx`
- Create: `app/course/thought-to-freedom/[module]/page.tsx`
- Create: `app/course/thought-to-freedom/thought-to-freedom.css`

**Interfaces:**
- Overview uses `getCourseDefinition("thought-to-freedom")`.
- Module route accepts `module` slug and lesson selection through `?lesson=recognize-it|catch-it-in-real-life|correct-the-thought`; orientation uses module slug `orientation`.
- Progress keys use stable format `orientation.complete`, `${moduleSlug}.${lessonSlug}.complete`, and response keys nested under the same lesson prefix.

- [ ] **Step 1: Build the overview page.**

Include hero, course explanation, Thought → Choice → Action → Consequence, 10-module outline, interactive-method explanation, lived-experience framing, and Start/Continue action.

- [ ] **Step 2: Build the dynamic module page with controlled not-found behavior.**

Unknown module slugs call `notFound()`. Read the logged-in user using the same client/session pattern as Turning Forward. Load `thought-to-freedom` progress, not the default course.

- [ ] **Step 3: Implement sequential locking.**

Rules:
- Orientation is available first.
- Module 1 unlocks when orientation is complete.
- Lesson 2 unlocks when Lesson 1 completes.
- Lesson 3 unlocks when Lesson 2 completes.
- Module N+1 unlocks only when Module N Lesson 3 completes.

Do not infer completion solely from page visits.

- [ ] **Step 4: Save progress locally first and cloud-sync for authenticated users.**

On save failure, keep current in-memory/local response and render a retry message; never unlock the next lesson unless the completion save succeeds locally and the app's existing cloud-sync semantics are satisfied.

- [ ] **Step 5: Add Thought to Freedom-specific visual treatment.**

Use TCF Learn variables and typography. Add strong module-number hierarchy, gold key-idea blocks, cream reading surfaces, distinct scenario cards, and visually paired old-thought/replacement-thought blocks.

- [ ] **Step 6: Run content tests and build.**

```bash
yarn test
yarn build
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add app/course/thought-to-freedom
git commit -m "feat: add Thought to Freedom course routes"
```

---

### Task 6: Convert the Dashboard into a True Multi-Course Hub

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/dashboard.css`

**Interfaces:**
- Dashboard reads the registry rather than treating Turning Forward as the only course.
- Thought to Freedom action states: `Start Course`, `Continue Course`, `Review Course`.
- Non-enrolled/non-started users do not receive fabricated progress percentages.

- [ ] **Step 1: Preserve current Turning Forward card behavior before refactoring.**

Record current title, route, enrollment gating, progress display rules, and thumbnail usage in code comments only where needed during the edit; do not change user-visible Turning Forward copy unless required for multi-course wording.

- [ ] **Step 2: Add the Thought to Freedom card.**

Display title, subtitle, `10 Modules`, `30 Lessons`, course artwork slot, status, and proper action button.

- [ ] **Step 3: Make progress loading course-specific.**

Use `loadCloudProgress(user.id, course.slug)` / `loadLocalProgress(course.slug)` independently for each course.

- [ ] **Step 4: Update responsive grid/styles.**

Desktop should accommodate two course cards without oversized whitespace; mobile stacks one card per row with readable titles and actions.

- [ ] **Step 5: Run full tests/build and manually verify Turning Forward link behavior.**

```bash
yarn test
yarn build
```

- [ ] **Step 6: Commit.**

```bash
git add app/dashboard/page.tsx app/dashboard/dashboard.css
git commit -m "feat: make dashboard multi-course"
```

---

### Task 7: Add the Final Thought to Freedom Action Plan and Completion Experience

**Files:**
- Create: `components/course/ActionPlanBuilder.tsx`
- Create: `app/course/thought-to-freedom/completion/page.tsx`
- Modify: `app/course/thought-to-freedom/thought-to-freedom.css`

**Interfaces:**
- Completion unlocks only when `module-10.correct-the-thought.complete === true`.
- Action plan saves under `actionPlan.*` keys within Thought to Freedom progress.
- Required fields: three recurring thinking errors, warning signs, triggers, old self-talk, replacement self-talk, one behavior for each pattern, accountability person/support resource, 30-day practice plan.

- [ ] **Step 1: Implement the required Action Plan form.**

Use controlled fields and a completion validator. Do not clinically score or rank the user's responses.

- [ ] **Step 2: Gate completion.**

If Module 10 is incomplete, redirect to the next required Thought to Freedom lesson. If complete, display the builder.

- [ ] **Step 3: Save the final plan and course-complete marker.**

Use `course.complete = true` only after all Action Plan required fields meet validation.

- [ ] **Step 4: Add a print-friendly view.**

Use CSS `@media print` to hide navigation/actions and print the user's Action Plan cleanly. Do not add a PDF dependency for the initial build.

- [ ] **Step 5: Add completion messaging and return-to-dashboard action.**

Copy reinforces that corrected thinking is a continued practice rather than a one-time finish line.

- [ ] **Step 6: Test/build and commit.**

```bash
yarn test
yarn build
git add components/course/ActionPlanBuilder.tsx app/course/thought-to-freedom
git commit -m "feat: add Thought to Freedom completion plan"
```

---

### Task 8: Regression Verification, Vercel Deployment, and Production Smoke Test

**Files:**
- Modify only files required by verified failures.

**Interfaces:**
- Production target is Vercel project `tcf-learn` linked to `riversantoine93-dotcom/TCF-Learn`.

- [ ] **Step 1: Run the complete automated suite.**

```bash
yarn test
yarn build
```

Expected: all tests PASS; Next.js production build succeeds.

- [ ] **Step 2: Verify the 30-lesson curriculum mechanically.**

Confirm:

```ts
thoughtToFreedomCourse.modules.length === 10
thoughtToFreedomCourse.modules.flatMap((module) => module.lessons).length === 30
```

Also verify every lesson includes a required reflection and knowledge check and every quiz has exactly one correct answer.

- [ ] **Step 3: Regression-check Turning Forward locally/preview.**

Verify:
- `/dashboard`
- `/course/turning-forward`
- at least one existing Turning Forward module route
- existing user progress loads with `turning-forward` default behavior
- completion route remains reachable under existing rules

- [ ] **Step 4: Verify Thought to Freedom preview.**

Verify:
- `/course/thought-to-freedom`
- orientation
- Module 1 Lesson 1
- Lesson 2 locked before Lesson 1 completion
- Lesson 2 unlock after completion
- refresh/resume behavior
- final completion page rejects users who have not finished Module 10

- [ ] **Step 5: Deploy through the connected Vercel project.**

Deploy the GitHub-backed `main` state to `tcf-learn`. Inspect deployment result and build logs for failures before calling the build complete.

- [ ] **Step 6: Production smoke test.**

Check production dashboard, Thought to Freedom overview, first lesson, responsive mobile layout, and Turning Forward overview. Check runtime errors after the smoke test.

- [ ] **Step 7: Final commit only if deployment verification required a code fix.**

```bash
git add <verified-fix-files>
git commit -m "fix: resolve Thought to Freedom deployment issue"
```

Do not create a cleanup commit when no changes are required.

---

## Plan Self-Review

- Spec coverage: orientation, 10 modules, 30 lessons, workbook-derived activities, case studies, sequential progression, independent progress, dashboard, course overview, completion Action Plan, mobile/accessibility, error behavior, Turning Forward regression, and Vercel deployment are all mapped to tasks.
- Placeholder scan: no TBD/TODO/deferred implementation placeholders remain.
- Type consistency: course slug names and progress helper signatures are consistent across tasks.
- Scope: facilitator dashboards, live group rooms, AI grading, accreditation, and new payments remain outside the initial build as specified.
