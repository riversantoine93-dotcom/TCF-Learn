# TCF Learn Course Completion Experience Design

## Goal
Create a distinct end-of-course experience for users who complete Module 8 of **Turning Forward: The Work Beyond Fear**.

## Completion Trigger
The existing Module 8 challenge completion remains the authoritative completion event. After the Module 8 challenge is marked complete, the module completion state should present a primary action labeled **Complete Turning Forward →** that routes to a dedicated course completion page.

The completion page must only present the completed state when the saved progress contains the Module 8 completion key. Users who reach the route without completing Module 8 should see a guarded message and a link back to the course.

## Completion Page
Create a dedicated completion page at `/course/turning-forward/completion`.

The page should include:

1. A prominent celebration area with the headline **YOU TURNED FORWARD** and supporting copy that recognizes completion without overstating transformation.
2. A progress summary showing:
   - 100% complete
   - 8 modules
   - 32 sections
3. A journey summary covering the eight module themes:
   - Identity — Who am I becoming?
   - Shame — What do I need to stop carrying?
   - Discipline — What must I consistently do?
   - Narrative — What story will I believe?
   - Accountability — What belongs to me?
   - Relationships — Who belongs around me?
   - Purpose — What am I building?
   - Forward — How will I live from here?
4. A final reflection section with three saved written prompts. Each response must follow the existing minimum response standard of at least 50 characters and save using the same local/cloud progress system used by the lessons.
5. A personalized certificate of completion using the authenticated user's full name when available, the course title **Turning Forward: The Work Beyond Fear**, and the completion date.
6. A **Download / Print Certificate** control that renders a print-friendly certificate using the browser print dialog, consistent with the existing commitments PDF pattern.
7. Clear next actions:
   - Return to TCF Learn Dashboard
   - Revisit the course
   - Continue into future TCF Learn courses through the dashboard

## Final Reflection
Use these three prompts:

1. **What has changed in the way you see yourself after completing Turning Forward?**
2. **What belief, habit, or weight are you committed to leaving behind?**
3. **What is the most important action you will carry forward from this course?**

Store the responses in progress using unique keys that do not collide with module lesson keys:
- `courseFinalReflection1`
- `courseFinalReflection2`
- `courseFinalReflection3`

The completion date should be stored once as `courseCompletedAt` when the completion page first confirms Module 8 completion. Existing completion dates must not be overwritten on later visits.

## Certificate
The certificate should visually match TCF Learn branding and contain:
- TCF LEARN
- CERTIFICATE OF COMPLETION
- User's full name, or **TCF Learn User** if no profile name is available
- Course title: **Turning Forward: The Work Beyond Fear**
- Completion date
- A short statement: **For completing all eight modules and the full Turning Forward learning experience.**

The certificate is generated client-side in a new printable window. No server-side PDF service or new dependency is required.

## Data and Access
Use the existing `ProgressData`, local progress, cloud progress, and authenticated user patterns. Do not add a new database table.

A completion page visit must merge local and cloud progress in the same manner as the current module page. The page should save final reflections and the course completion date locally and to the authenticated account when available.

## Mobile and Accessibility
The page must be fully usable on mobile. Buttons must remain tap-friendly, certificate actions must not depend on hover, and final reflection status text must use accessible live-status patterns consistent with the existing lesson response requirements.

## Non-Goals
- No external credential verification service.
- No emailed certificate.
- No social-sharing integration.
- No additional payment or enrollment flow.
- No new speech-to-text or microphone functionality.
