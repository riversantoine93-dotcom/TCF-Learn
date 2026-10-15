# Lesson-specific teaching expansion

Prepared October 15, 2026 for the existing 30-course, 474-lesson catalog.

## Changes

Every lesson has three authored additions, matched by course slug, lesson number, and title:

1. A specific explanation or distinction in the first existing teaching topic.
2. A worked application in the second existing topic, including illustrative arithmetic, code behavior, decision examples, or communication scripts when appropriate.
3. A practical verification or follow-through check in the third existing topic.

The initial content set adds 26,632 words across 474 distinct lesson records (45–72 words per lesson), plus source context. Existing teaching, scenarios, reflections, and practical examples remain. No component, heading structure, CSS, navigation, or completion requirement was changed. Recall comparison guides also use the expanded content. All facilitator guides and printable course packs use the same generated topics and references.

## Sources and editorial treatment

`lib/learning/lesson-depth.json` is the canonical authored lesson map. `lib/lesson-depth-sources.json` registers the added reading metadata, alongside the earlier source registry. Resources include government technical handbooks and guidance, current official agency material, standards-body documentation, vendor documentation, and industry-association or manufacturer technical references. A resource's publication date is separate from the date its link or search-index information was reviewed. Some publishers restrict automated retrieval; an indexed official source is not a claim that every page of a paywalled or restricted publication was read.

References are background for the named concepts. Worked examples and scripts are original TCF illustrations, not quotations, research findings, real customer records, market prices, or required operating procedures. Numerical examples explicitly state assumptions. No statistics about learner outcomes or employability were invented. Provider or product documentation is not represented as a universal legal rule.

Trade material remains conceptual and does not authorize regulated work. DoD plumbing criteria are labeled as technical background with a limited jurisdictional scope. Historical DOE electrical theory is not presented as current installation code. Georgia DDS guidance remains state-specific, and TCF study is not ELDT or CDL qualification. Financial and housing examples require the actual terms and applicable local advice. NHS, VA, and SAMHSA materials support general educational concepts, not a claim that the course's named thinking-pattern taxonomy is clinically validated or that TCF provides treatment.

## Preservation and verification

- Every course and lesson is covered, with title matching to prevent silently shifting content when outlines change.
- Original source notes, especially regulatory scope and exceptions, are preserved when a new reading shares a source ID.
- Reapplying the runtime content generator preserves the same topics and source notes without duplication.
- The entire previously published five-question bank, order, correct indices, and feedback is unchanged; its serialized SHA-256 is `2193ea258a7d7bd6103afdfa417133bbbd57a6e6177fbce0f9c1d1d86884b3cd`.
- Existing historical completion and account data require no migration or rewrite. The API's current content generator enriches lessons on read; build-time generation supplies the same material to facilitator packs.
- Automated checks cover all 474 lesson additions, source resolution, concrete numerical examples, regeneration stability, question-bank preservation, legacy reference parity, and facilitator alignment.
