# Uploaded readings: October 15, 2026

All 20 supplied PDFs are represented in the 30-course, 474-lesson catalog. Twenty like-named courses receive 300 direct reading additions. The remaining ten courses receive 174 explicitly labeled supporting-skill additions. They retain their existing trade-specific or primary-source teaching; a facilities-management overview is never presented as electrical, welding, or CDL operating instruction.

Each lesson adds a short explanation, an original written practice task, a practical check, and recall-guide support inside the existing seven-step microlearning structure. Scenarios, reflections, five graded multiple-choice questions, open navigation, learner-controlled pace, and full-course certificate requirements retain their published behavior. Assessments and answer positions are unchanged so existing saved answers remain meaningful.

## Sources and mapping

`lib/learning/pdf-sources.json` records the actual document title, attribution, uploaded filename, PDF page count, SHA-256, review date, and scope limitation. Page references use the PDF viewer's one-based physical page number, which can differ from the page number printed on a sheet.

`scripts/pdf-course-notes/` contains original editorial teaching and exercises, ordered against the existing course outline. Each line gives page locations, teaching, practice, and a check. The build validates title/order/count and page bounds before producing `lib/learning/pdf-lessons.json`. `scripts/apply-pdf-lessons.mjs` applies the same content to generated lessons and authenticated runtime responses, including existing database rows. It removes its own previous references when regenerated.

The learner reference panel and facilitator packs display the uploaded title, attribution, and pages as text. No PDF download URL is fabricated. Uploaded PDF files, publisher illustrations, worksheets, proprietary question banks, diagnostic instruments, and raw extracted text are not published to the repository. Existing CC0 illustrations remain separately licensed.

## Editorial limits

- The web-design upload contains front matter, not full instructional chapters. It informs curriculum alignment; substantive implementation remains grounded in the existing linked technical sources.
- The housing upload is an unattributed planning aid. The rent benchmark and suggested document list are qualified examples, not universal requirements or legal rules.
- The facilities PDF is a historical article export. It supports observation, records, roles, and coordination, not current standards or specialist repair procedures.
- Office and spreadsheet uploads contain mixed-version and older interfaces. Teach stable concepts instead of requiring obsolete menu paths.
- The networking title and old exam references do not establish current certification requirements.
- Reentry and employment documents contain older contacts, wage bands, benefits, and legal statements. These are not republished as current requirements.
- The finance PDF is scanned. OCR was checked against page images; flexible budgets and original arithmetic examples are used without product endorsements, outcome promises, or personalized advice.
- Clinical worksheets, resilience scoring instruments, and treatment claims are excluded. General support skills do not validate the named TCF thinking-pattern taxonomy.
- AI and communication documents contain promotional or unattributed statistics. Those figures and legal timelines are omitted.
- Leadership principles credit the Council on Foundations, Aspen Institute Community Strategies Group, and CFLeads; original individual applications replace organizational forms.

The original lesson-depth, regulatory, consumer, and technical references remain present. New uploaded-source attribution describes its limited role rather than implying official endorsement or current legal authority.

## Verification

The PDF-reading tests cover all 474 mappings, 20 source identities, page bounds, course-title alignment, direct versus supporting labels, idempotent runtime enrichment, accessible source rendering, and facilitator parity. Existing checks cover the preserved assessment bank, navigation, completion rules, and certificate eligibility. Production builds run the complete test suite.
