# Course Completion Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a guarded, branded Turning Forward completion experience with saved final reflections, a personalized printable certificate, and clear next steps after Module 8.

**Architecture:** Reuse the existing progress/auth patterns instead of adding new backend tables or dependencies. Module 8 will link to a dedicated client-side completion page that loads merged progress, verifies the Module 8 completion key, saves three final reflections and a one-time completion date, and generates a print-friendly certificate in a new browser window.

**Tech Stack:** Next.js App Router, React client components, existing Supabase auth/progress helpers, existing CSS system, browser print API.

**Spec:** `docs/superpowers/specs/2026-09-01-course-completion-experience-design.md`

## Global Constraints

- Course title must remain exactly `Turning Forward: The Work Beyond Fear`.
- Completion page route must be `/course/turning-forward/completion`.
- Final reflection minimum length is 50 characters per response.
- Do not add speech-to-text or microphone functionality.
- Do not add a new database table or external PDF dependency.
- Completion page must be mobile usable and guarded by Module 8 completion state.

---

### Task 1: Add Module 8 completion handoff

**Files:**
- Modify: `app/course/turning-forward/[module]/page.tsx`

**Interfaces:**
- Consumes: existing `challengeDoneKey(module.number)` and `saved` progress state.
- Produces: a `Complete Turning Forward →` link to `/course/turning-forward/completion` when `module.number === 8` and the challenge is complete.

- [ ] **Step 1: Add a failing behavioral check by inspection**

Confirm the current completion branch only renders `Save My Commitments as PDF` and `Return to course` for all modules, including Module 8.

Expected: no dedicated course completion action exists.

- [ ] **Step 2: Implement the minimal Module 8 branch**

Inside the existing completed challenge UI, keep `Save My Commitments as PDF`. For Module 8, replace the secondary return action with:

```tsx
<Link className="button secondary" href="/course/turning-forward/completion">
  Complete Turning Forward →
</Link>
```

For Modules 1–7, preserve the existing `Return to course` action.

- [ ] **Step 3: Verify the branch logic**

Check that:
- Modules 1–7 still show `Return to course`.
- Module 8 shows `Complete Turning Forward →` only after its challenge is complete.

- [ ] **Step 4: Commit**

```bash
git add app/course/turning-forward/[module]/page.tsx
git commit -m "feat: add course completion handoff"
```

---

### Task 2: Create the guarded completion page and progress flow

**Files:**
- Create: `app/course/turning-forward/completion/page.tsx`
- Create: `app/course/turning-forward/completion/completion.css`

**Interfaces:**
- Consumes: `useAuth()`, `loadLocalProgress()`, `loadCloudProgress(user.id)`, `saveLocalProgress()`, `saveCloudProgress(user.id, progress)`, and `ProgressData` from the existing progress library.
- Produces: guarded completion page state, saved final reflections, and `courseCompletedAt`.

- [ ] **Step 1: Write the guarded-state logic first**

Use the existing Module 8 challenge completion key `m8challenge` as the gate. The page should load local progress, merge cloud progress when authenticated, and expose a `ready` state before rendering the completion content.

Pseudo-implementation shape:

```tsx
const COMPLETE_KEY = "m8challenge";
const REFLECTION_KEYS = [
  "courseFinalReflection1",
  "courseFinalReflection2",
  "courseFinalReflection3",
] as const;
const COMPLETED_AT_KEY = "courseCompletedAt";
```

When `saved[COMPLETE_KEY]` is false after loading, render a guarded message with a link to `/course/turning-forward/module-8`.

- [ ] **Step 2: Set completion date exactly once**

After progress loads and `m8challenge` is true, if `courseCompletedAt` is absent, write the current ISO date-time string into progress:

```tsx
setSaved(current => ({
  ...current,
  courseCompletedAt: new Date().toISOString(),
}));
```

Do not overwrite an existing value on repeat visits.

- [ ] **Step 3: Reuse existing local/cloud save behavior**

Mirror the current module-page save effect:

```tsx
useEffect(() => {
  if (!ready) return;
  saveLocalProgress(saved);
  if (!user) return;
  const timer = setTimeout(() => {
    saveCloudProgress(user.id, saved).catch(() => undefined);
  }, 500);
  return () => clearTimeout(timer);
}, [saved, user, ready]);
```

- [ ] **Step 4: Add the three final reflection fields**

Use ordinary `<textarea className="large">` controls, not the removed voice component. Each response is complete only when `trim().length >= 50`.

Prompts:

```ts
const finalPrompts = [
  "What has changed in the way you see yourself after completing Turning Forward?",
  "What belief, habit, or weight are you committed to leaving behind?",
  "What is the most important action you will carry forward from this course?",
];
```

Show the same style of live requirement messaging used elsewhere:
- empty: `Required: write at least 50 characters.`
- incomplete: `Keep going — N more characters remaining.`
- complete: `✓ Requirement met`

- [ ] **Step 5: Build the celebration and journey summary**

Render:
- eyebrow: `COURSE COMPLETE`
- headline: `YOU TURNED FORWARD`
- progress cards: `100% COMPLETE`, `8 MODULES`, `32 SECTIONS`
- eight journey cards with the approved module titles/questions.

- [ ] **Step 6: Add mobile-responsive styling**

In `completion.css`, provide focused styles for:
- `.course-completion-shell`
- `.completion-hero`
- `.completion-stats`
- `.journey-grid`
- `.final-reflection`
- `.certificate-panel`
- `.completion-next-actions`

Use responsive grid fallbacks at approximately 900px and 620px so the page becomes single-column on narrow screens.

- [ ] **Step 7: Verify guarded and completed states**

Manual checks:
- With no `m8challenge`, page shows guard and no certificate/reflections.
- With `m8challenge=true`, page shows completion experience.
- Refresh does not replace an existing `courseCompletedAt`.
- Each reflection saves locally and, when authenticated, syncs to cloud.

- [ ] **Step 8: Commit**

```bash
git add app/course/turning-forward/completion/page.tsx app/course/turning-forward/completion/completion.css
git commit -m "feat: add Turning Forward completion page"
```

---

### Task 3: Add printable personalized certificate

**Files:**
- Modify: `app/course/turning-forward/completion/page.tsx`

**Interfaces:**
- Consumes: authenticated user's `user_metadata.full_name`, saved `courseCompletedAt`.
- Produces: `printCertificate(name: string, completedAt: string)` client-side print flow.

- [ ] **Step 1: Add certificate formatting helpers**

Create safe HTML escaping and completion-date formatting helpers:

```tsx
function escapeHtml(value:string){
  return value.replace(/[&<>'"]/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "'":"&#39;",
    '"':"&quot;"
  }[ch] || ch));
}

function formatCompletionDate(value:string){
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Completion date unavailable"
    : date.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
}
```

- [ ] **Step 2: Implement printable certificate window**

Use `window.open()` and `window.print()` following the existing commitments-PDF pattern. Certificate content must include:

```text
TCF LEARN
CERTIFICATE OF COMPLETION
[User Full Name or TCF Learn User]
Turning Forward: The Work Beyond Fear
For completing all eight modules and the full Turning Forward learning experience.
[Completion Date]
```

Use print CSS with landscape orientation:

```css
@page { size: landscape; margin: .5in; }
```

- [ ] **Step 3: Add the visible certificate panel**

Show the user's name, course title, and formatted completion date on the page, followed by a button labeled `Download / Print Certificate`.

- [ ] **Step 4: Verify fallback behavior**

Manual checks:
- Authenticated user with full name shows personalized certificate.
- Missing profile name falls back to `TCF Learn User`.
- Invalid/missing completion date does not crash the page.
- Print button opens a print-friendly certificate and invokes the browser print dialog.

- [ ] **Step 5: Commit**

```bash
git add app/course/turning-forward/completion/page.tsx
git commit -m "feat: add printable completion certificate"
```

---

### Task 4: Add completion next steps and verify full flow

**Files:**
- Modify: `app/course/turning-forward/completion/page.tsx`
- Modify: `app/course/turning-forward/completion/completion.css`

**Interfaces:**
- Consumes: existing dashboard and course routes.
- Produces: final navigation actions and complete end-to-end course completion flow.

- [ ] **Step 1: Add next-step navigation**

Add a final section with:

```tsx
<Link className="button" href="/dashboard">Return to TCF Learn Dashboard</Link>
<Link className="button secondary" href="/course/turning-forward">Revisit Turning Forward</Link>
```

Include supporting copy that future TCF Learn courses will appear in the dashboard.

- [ ] **Step 2: Verify the complete user journey**

Manual end-to-end sequence:
1. Finish Module 8 Lesson 3.
2. Open Module 8 Challenge.
3. Complete all challenge fields and pledge.
4. Click `I Commit to Turning Forward`.
5. Confirm Module 8 completion UI appears.
6. Click `Complete Turning Forward →`.
7. Confirm `YOU TURNED FORWARD` page appears.
8. Confirm stats read 100%, 8 modules, 32 sections.
9. Complete all three final reflections with 50+ characters.
10. Refresh and confirm reflections persist.
11. Print certificate and confirm personalized name/date/course title.
12. Return to dashboard and confirm course progress remains complete.

- [ ] **Step 3: Run repository validation**

Run the project's available build/typecheck commands from `package.json`. At minimum, run the production build if available:

```bash
npm run build
```

Expected: build succeeds with no TypeScript or route errors.

- [ ] **Step 4: Commit**

```bash
git add app/course/turning-forward/completion/page.tsx app/course/turning-forward/completion/completion.css
git commit -m "feat: finish course completion experience"
```
