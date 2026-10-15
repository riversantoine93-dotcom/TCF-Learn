# TCF Learn microlearning design standard

Applies to all 30 courses and 474 required lessons. Implemented October 15, 2026.

## Learner experience

Each existing 20-minute lesson is a sequence of seven freely selectable short steps: Start (1 minute), Understand (3), Apply (4), Verify (3), Scenario (4), Knowledge check (3), and Daily practice (2). Estimates guide planning; there is no timer, minimum seat time, forced sequence, or navigation lock. The three taught topics and full examples remain intact. Short steps can be studied in separate visits.

- **Cognitive load:** one teaching topic is visible at a time, its goal is adjacent to the explanation, worked examples precede independent scenario practice, and optional source detail is progressively disclosed. Each topic includes recall with a revealable comparison guide. Five assessment questions appear one at a time. Short duration alone does not establish instructional effectiveness.
- **Self-determination:** learners can choose any lesson/step, start with explanation or scenario, enter a personally useful goal, pause, or revisit teaching. Feedback explains reasoning and permits unlimited retries. Clear success criteria and an optional confidence reflection support competence. Every lesson offers a specific optional conversation with a trusted peer, facilitator, or qualified trainer; independent learning and hypothetical examples remain acceptable. No social feature or automatic message is implied.
- **Habit transfer:** learners can identify a familiar cue, a small routine, and evidence to check. Lesson-specific examples scaffold their own plan. Plans can be added to the existing next-step response. Optional reviews can be planned in 1, 3, or 7 days, with recall before rereading and a fresh example. Review plans are listed on the dashboard and course overview, stored only on the current device, and send no notifications. Missed opportunities invite a restart, not a streak penalty. No fixed timeline or guaranteed transfer is claimed.

## Completion and persistence

The existing scenario reflection, next-step response, and five correct quiz answers still record lesson completion. Course certificates still require every required lesson. Goals, confidence, sharing, habit reviews, and time spent are optional and do not affect eligibility. Existing question IDs/order, answer indices, historical completion records, and account-saved responses are preserved. No database migration is required: runtime content uses the same generator as build-time content, and a habit plan added to a completed response is saved in the existing action field. In-progress response drafts, step position, goal/confidence, habit drafts, and review dates are device-local and namespaced by user and lesson.

Facilitator guides and full-course printable packs use the same chunks, recall prompts, connection prompts, habits, and question keys. Facilitators may expand discussion or facilitate one chunk at a time; estimated time is not attendance policy. Trade scenarios remain written and do not authorize regulated work.

## Evidence informing these design choices

These are design applications of the sources, not claims that the TCF courses themselves have been experimentally validated.

1. NSW Centre for Education Statistics and Evaluation. *Cognitive load theory in practice* (2018). Explicit guidance, worked examples, attention to existing knowledge, practice/feedback, and removal of inessential material. https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators-/cognitive-load-theory-in-practice
2. Center for Self-Determination Theory. *Education* and *Theory*. Support for autonomy, competence, and relatedness in learning. https://selfdeterminationtheory.org/topics/application-education/ and https://selfdeterminationtheory.org/theory
3. Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). *How are habits formed: Modelling habit formation in the real world*. European Journal of Social Psychology, 40, 998–1009. Repetition in a consistent context and substantial individual variation; missing one opportunity did not materially alter the observed process. This health-behavior study does not directly prove workplace skill transfer. https://doi.org/10.1002/ejsp.674

## Verification

Automated coverage checks every lesson for short chunks, recall, specific cue/routine/evidence, current question alignment, completion rules, and matching facilitator packs. Storage tests cover malformed data, user separation, deduplication, review dates, and capacity. A server-render test checks the initial focused view and open route choices. Production build validates the React and API integration. These checks establish implemented behavior and content coverage, not measured learner outcomes.
