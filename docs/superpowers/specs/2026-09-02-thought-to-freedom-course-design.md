# Thought to Freedom: Correcting Criminal Thinking Errors — Course Design

Date: 2026-09-02
Status: Approved framework; design specification pending final user review
Repository: `riversantoine93-dotcom/TCF-Learn`
Deployment target: Vercel project `tcf-learn`

## 1. Purpose

Add a second full course to the existing TCF Learn platform: **Thought to Freedom: Correcting Criminal Thinking Errors**.

The course is based on Antoine Rivers' *From Thought to Freedom: Correcting Criminal Thinking Errors* participant workbook and his lived experience learning and applying criminal-thinking concepts while incarcerated. The course may acknowledge the influence of Antoine's study of Dr. Stanton Samenow and Dr. Samuel Yochelson, while presenting the curriculum in Antoine's own TCF Learn voice and avoiding the impression that either scholar authored, endorsed, or formally certified this course.

The course should help users identify recurring thinking patterns, connect those patterns to choices and consequences, interrupt the pattern before action, replace it with a more responsible thought process, and practice the replacement response.

Primary learning loop:

**Recognize → Examine → Interrupt → Replace → Practice**

The course should avoid reducing a person to a permanent label such as “criminal thinker.” The instructional frame is that thinking patterns can be learned, examined, challenged, and changed.

## 2. Product Positioning

TCF Learn remains the umbrella learning platform.

Course 1 remains:
- **Turning Forward**

Course 2 becomes:
- **Thought to Freedom**
- Subtitle: **Correcting Criminal Thinking Errors**
- Supporting line: **Examine the thought. Challenge the pattern. Choose a different response.**

Thought to Freedom should visually belong to TCF Learn while feeling distinct from Turning Forward. It should preserve the black, cream, gold, and strong editorial typography used by the current platform, but lean more heavily into reflection, thought-pattern identification, decision points, correction exercises, case-study cards, and accountability prompts.

## 3. Course Architecture

The existing TCF Learn application will be extended rather than duplicated.

The dashboard becomes a multi-course hub. Turning Forward keeps its current functionality and routes. Thought to Freedom gets a dedicated course entry point and its own independent progress state.

Recommended route structure:

- `/dashboard`
- `/course/turning-forward/...` or existing Turning Forward routes retained as-is
- `/course/thought-to-freedom`
- `/course/thought-to-freedom/module/[moduleSlug]`
- `/course/thought-to-freedom/module/[moduleSlug]/lesson/[lessonSlug]`
- `/course/thought-to-freedom/completion`

Do not break existing links to Turning Forward during the multi-course refactor.

## 4. Course Map

The workbook's ten chapters become ten modules.

### Module 1 — The Closed Channel
Core question: **What truth am I refusing to hear?**

Workbook foundation:
- Blocking feedback, criticism, correction, and truth
- Refusing to listen, reflect, or learn
- Mentor/mentee role-play
- Lisa and the Counselor case study
- Feedback-response worksheet
- Journaling on the cost of being closed off

### Module 2 — Viewing Self as a Good Person
Core question: **Am I using good deeds to avoid looking at harm?**

Workbook foundation:
- Using isolated good deeds to justify or distract from harmful choices
- The Mirror Doesn't Lie
- Good Deeds vs. Harmful Actions balance sheet
- Seeing oneself clearly instead of selectively

### Module 3 — Victimstance
Core question: **Where am I giving away responsibility?**

Workbook foundation:
- Blaming others, systems, relationships, or circumstances
- Flip the Story
- James and the Parole Officer case study
- Rewrite three blame narratives with the user as the person responsible for the next choice

### Module 4 — Lack of Effort
Core question: **Where am I expecting results without sustained work?**

Workbook foundation:
- Laziness, procrastination, quitting, and inconsistent effort
- One-Hour Challenge
- S.T.E.P.S.: Strategic Tasks Executed Persistently and Slowly
- Three small goals and action steps

### Module 5 — Lack of Interest in Responsible Performance
Core question: **What responsibilities am I refusing to fully own?**

Workbook foundation:
- Dismissing or avoiding responsible roles
- Responsibility Roleplay
- Role inventory and 1–5 self-rating
- Improvement commitment for one life role

### Module 6 — Ownership Attitude
Core question: **Where am I confusing control with respect?**

Workbook foundation:
- Treating people or things as possessions
- Controlling behavior and relationship consequences
- “Not Mine” exercise
- Respect-based replacement approaches
- Apology-letter journaling exercise

### Module 7 — Fear of Fear
Core question: **What fear is hiding underneath my reaction?**

Workbook foundation:
- Denying or avoiding fear
- Fear hidden behind anger or aggression
- Fear Board
- Kevin's Reaction to a Job Interview case study
- Identify top three fears and one action for each

### Module 8 — Lack of Time Perspective
Core question: **What will this decision cost me later?**

Workbook foundation:
- Living only for the immediate moment
- Short-term choices with long-term damage
- Future Letter
- One-month, six-month, and one-year goals

### Module 9 — Power Thrust
Core question: **Am I trying to control others instead of myself?**

Workbook foundation:
- Intimidation, manipulation, dominance, and force
- Power Redefined Panel
- Malik and the Group Discussion case study
- Rebuilding trust in three relationships
- Positive definitions of power

### Module 10 — Uniqueness
Core question: **Where do I believe the rules should not apply to me?**

Workbook foundation:
- Believing normal rules or consequences do not apply
- Common Ground Circles
- Exception-thinking worksheet
- Connection to others as an alternative to exemption thinking

## 5. Standard Module Pattern

Each module contains three interactive lessons.

### Lesson 1 — Recognize It
Purpose:
- Define the thinking error in plain language
- Identify common internal statements and rationalizations
- Show how the pattern appears behaviorally
- Connect the thought pattern to consequences

Standard elements:
- Short lesson opener/video slot
- Key Idea
- Definition
- “What it sounds like in your head” examples
- Reflection response
- Knowledge check

### Lesson 2 — Catch It in Real Life
Purpose:
- Apply the concept to realistic situations
- Slow down the sequence between thought and action
- Identify decision points

Standard elements:
- Scenario or case study
- “Catch the Thought” interaction
- Decision-point question
- Consequence comparison
- Written response
- Knowledge check

### Lesson 3 — Correct the Thought
Purpose:
- Replace the thinking error with a responsible thought pattern
- Require personal application
- End with a specific behavioral commitment

Standard elements:
- Replacement-thinking model
- Workbook-derived activity or worksheet
- Personal example
- “What I will tell myself instead” response
- Commitment/challenge
- Module completion check

This creates 10 modules × 3 lessons = **30 core lessons**.

## 6. Orientation

Before Module 1, add a course orientation titled:

**Before the Action Comes the Thought**

Orientation goals:
- Explain the Thought → Choice → Action → Consequence chain
- Explain that the course focuses on patterns, not permanent labels
- Establish accountability without shame
- Introduce the Recognize → Examine → Interrupt → Replace → Practice loop
- Briefly explain that Antoine's approach was shaped by his incarceration experience and his study of criminal-thinking work, including Samenow and Yochelson
- Set expectations for honest written reflection

The orientation should be completable but should not count as one of the ten criminal-thinking modules.

## 7. Interactive Learning Components

Thought to Freedom should reuse proven TCF Learn mechanics where appropriate while expanding the interaction model beyond simple quiz pages.

Required interaction types:

1. **Reflection responses**
   - Minimum character requirement consistent with the current TCF Learn response-box behavior unless intentionally changed platform-wide.
   - Save progress.

2. **Multiple-choice knowledge checks**
   - No answer preselected.
   - One correct answer.
   - Incorrect answers receive explanatory feedback.

3. **Case-study decisions**
   - Present a realistic situation.
   - Ask the user to identify the thinking error or decision point.
   - Follow with consequence and correction prompts.

4. **Catch the Thought cards**
   - Present statements such as rationalizations, blame statements, control statements, or short-term thinking.
   - User identifies what is happening and selects or writes a replacement thought.

5. **Workbook-derived activities**
   - Mirror Doesn't Lie
   - Flip the Story
   - S.T.E.P.S.
   - Responsibility Roleplay / Role Inventory
   - Not Mine
   - Fear Board
   - Future Letter
   - Power Redefined
   - Common Ground Circles

6. **Module commitments**
   - Each module ends with a specific personal commitment or practice.
   - Module cannot be marked complete until required fields/checks are complete.

## 8. Progression Rules

Thought to Freedom follows sequential progression.

- Users can see the full module outline.
- A user can enter the first available lesson.
- Later lessons remain locked until the previous required lesson is completed.
- Completing Lesson 3 unlocks the next module.
- Course progress is stored independently from Turning Forward progress.
- Returning users resume at their next incomplete Thought to Freedom lesson.
- Existing Turning Forward progress must remain unchanged.

If the current application already has enrollment/course-access gating, extend that system to support a course identifier rather than creating a separate authentication path.

## 9. Dashboard Experience

The dashboard should function as a course hub rather than a Turning Forward-only landing page.

Thought to Freedom course card should include:
- Course title
- Subtitle
- Thumbnail/artwork slot
- 10 modules
- 30 lessons
- Progress indicator when enrolled/started
- Status such as Not Started / In Progress / Completed
- Primary action: Start Course / Continue Course / Review Course

Users who are not enrolled should not be shown fake progress. Existing dashboard rules about hiding enrolled-course progress elements from users who are not enrolled should be preserved.

## 10. Course Overview Page

`/course/thought-to-freedom`

Sections:
1. Course hero
2. What this course is about
3. “Before the action comes the thought” explanation
4. What users will learn
5. Ten-module outline
6. How the interactive lessons work
7. Antoine's lived-experience framing
8. Start/continue course action based on user state

Tone:
- Direct
- Accountable
- Non-clinical
- Reflective
- Respectful
- No glorification of criminal behavior
- No shaming language

## 11. Completion Experience

After Module 10, users complete a final **Thought to Freedom Action Plan**.

Required sections:
- My three strongest recurring thinking errors
- My warning signs
- My common triggers
- What I usually tell myself
- What I will tell myself instead
- One behavior I will practice for each pattern
- My accountability person or support resource
- My 30-day practice plan

Completion page should:
- Acknowledge course completion
- Reinforce that correction is a continuing practice
- Summarize the user's selected commitments where technically appropriate
- Provide a print/download-friendly Action Plan view if the existing platform's completion/PDF infrastructure can support it without major unrelated work
- Return the user to the dashboard

## 12. Content Model

The implementation should move toward a reusable multi-course content structure rather than hard-coding 30 separate page implementations.

Recommended conceptual types:

```ts
Course {
  id
  slug
  title
  subtitle
  description
  modules[]
}

Module {
  id
  slug
  title
  coreQuestion
  keyIdea
  lessons[]
  challenge
}

Lesson {
  id
  slug
  title
  type
  objective
  contentBlocks[]
  questions[]
  requiredResponses[]
}
```

Exact types should follow existing code patterns discovered during implementation.

Course identifiers must be explicit so Turning Forward and Thought to Freedom can coexist without progress collisions.

## 13. Data and Supabase

Use the existing Supabase integration and authentication model.

Implementation must inspect the current progress schema before changing it. Preferred direction:
- retain existing user IDs/auth
- add or use `course_id` / `course_slug` in progress and enrollment records
- store module/lesson completion independently by course
- preserve backward compatibility with existing Turning Forward users

Do not make destructive schema changes without a migration path.

## 14. Component Strategy

Reuse existing components wherever they already solve the requirement cleanly.

Likely reusable/shared areas:
- Header/navigation
- Theme toggle
- Dashboard shell
- Course shell/sidebar
- Progress indicator
- Lesson navigation
- Response fields
- Quiz/feedback mechanics
- Completion controls
- Supabase client/session utilities

New Thought to Freedom-specific components may include:
- `ThinkingErrorHeader`
- `CatchTheThought`
- `DecisionPointCard`
- `ReplacementThought`
- `WorkbookActivity`
- `ActionPlanBuilder`

Names are illustrative; implementation should align with repository conventions.

## 15. Visual Design

Preserve TCF Learn's established brand system.

Thought to Freedom-specific emphasis:
- Strong module number + thinking-error title
- Core question directly under module title
- Gold key-idea callouts
- Cream/black reading surfaces
- Scenario cards that are visually distinct from lesson explanation
- Correction/replacement blocks that visually signal movement from old thought to new thought
- Clear lock/completion states
- Mobile-first response fields and buttons

Avoid decorative prison imagery, bars, handcuffs, mugshots, or stereotypical “criminal justice” graphics. The visual language should communicate thought, reflection, accountability, movement, and freedom.

## 16. Accessibility and Mobile Behavior

- All lesson functionality must work on mobile.
- Interactive controls must have visible labels and keyboard-accessible behavior.
- Do not rely only on color to indicate correct/incorrect/locked/completed states.
- Maintain readable text sizing and contrast in both light and dark modes.
- Long workbook activities should stack cleanly on small screens.
- Progress and Continue controls should remain obvious after video or long-form content finishes.

## 17. Error Handling

- If progress save fails, preserve the user's visible response locally where feasible and show a retryable error state.
- A failed progress request must not falsely unlock the next lesson.
- Missing or malformed lesson slugs should return a controlled not-found state.
- Users without access should be routed through the existing course-access behavior, not exposed to protected lesson content.
- Turning Forward routes and saved progress should remain usable if Thought to Freedom content has an error.

## 18. Testing Requirements

At minimum verify:

### Existing-course regression
- Turning Forward dashboard card still works.
- Existing Turning Forward lesson routes load.
- Existing users retain progress.
- Existing login/profile behavior is unchanged.

### Thought to Freedom
- Course overview loads.
- All 10 modules appear in correct order.
- All 30 lessons resolve.
- Sequential lock/unlock behavior works.
- Required responses prevent premature completion.
- Knowledge-check feedback behaves correctly.
- Progress survives refresh/login return.
- Module 10 unlocks final Action Plan.
- Completion returns a valid completed course state.

### Responsive/UI
- Dashboard course cards work on desktop and mobile.
- Lesson sidebar/navigation works on mobile.
- Long text inputs do not overflow.
- Dark/light theme remains legible.

### Build/deployment
- `npm`/`pnpm` test or validation commands used by the repo pass.
- Production build passes.
- Vercel deployment succeeds.
- Production smoke test covers dashboard, Thought to Freedom overview, first lesson, and Turning Forward regression.

## 19. Scope Boundaries for Initial Build

Included:
- Multi-course dashboard support
- Thought to Freedom overview
- Orientation
- 10-module / 30-lesson framework
- Interactive content structure
- Progression and completion framework
- Workbook-derived activities
- Final Action Plan
- Responsive TCF Learn styling

Not required for the first framework implementation unless already supported and easy to reuse:
- Facilitator/admin cohort dashboards
- Group discussion rooms
- Live instructor scheduling
- AI grading of personal reflections
- Clinical/diagnostic scoring
- External accreditation or certification claims
- New payment processor architecture

## 20. Source Integrity

The initial content build should preserve the workbook's terminology and chapter organization. Where the workbook does not provide a formal definition or sufficient instructional copy, implementation should not silently attribute invented language to Samenow, Yochelson, or the workbook. Expanded lesson copy may be written in the TCF Learn voice, but it should be treated as new instructional material inspired by the approved course framework and clearly separated from direct scholarly attribution.

## 21. Success Criteria

The design is successful when:

1. TCF Learn clearly supports more than one course.
2. Turning Forward continues to work without regression.
3. Thought to Freedom appears as a complete 10-module course shell with 30 interactive lessons.
4. The workbook is recognizable in the course's concepts, activities, examples, and reflection structure.
5. Users can progress sequentially and resume later.
6. The course consistently teaches users to identify, interrupt, replace, and practice corrected thinking.
7. The final Action Plan converts course learning into a personal 30-day practice plan.
8. The deployed Vercel build works on desktop and mobile.
