# Treiglap improvement plan

Last updated: 2026-09-26

This plan incorporates the owner's decisions following the [audit](AUDIT_2026-09-26.md). The audit is a historical snapshot; [Phase 1 delivery](PHASE_1_DELIVERY.md) records subsequent changes.

## Agreed direction and constraints

Treiglap is an adult learner pilot for practising Welsh mutations across a broad range of contexts. **Retain, correct and expand the full bank.** A small set of repetitive beginner exercises would miss its purpose. Machine validation is not a Welsh correctness certificate, and incomplete metadata is not a reason to silently discard the owner's content.

Learners must be able to design their own sessions using level, topic, mutation structure and other useful filters. Curated sessions should help with specific needs: place names, a difficult construction, contrasts between mutation types, or avoiding over-mutation. Custom sessions are a central route, not an obscure advanced feature.

Align material with Dysgu Cymraeg where it helps learners, while deliberately extending exposure beyond the examples in the books. **Do not create a compulsory session for every unit.** Some units contain no mutation material. Unit/page references provide provenance; they do not dictate the session catalogue. Use dialect labels when they affect an answer or explanation. Register distinctions are a lower priority.

**Preserve the existing aesthetic, visual hierarchy, responsive behaviour and touch targets. Ask the owner before implementing any design change.** A finding or a proposed improvement in this document is not design approval. Present a concrete, limited proposal when approval is needed; do not undertake a redesign.

Support retained learning history. Hosting must be explained and set up with the owner; do not assume they can administer a server. Phase 1 prepares and tests a local Node runtime without choosing or deploying a paid hosting service.

## Sequence

| Phase | Outcome | Status |
| --- | --- | --- |
| Baseline | Preserve the working content and existing registry work | Local byte-for-byte backup and hash manifest captured |
| 1 | Validate content, save safely, resolve identity collisions | Implemented locally; see delivery record |
| 2 | Correct Welsh and systematically classify the whole bank | Next substantial workstream |
| 3 | Dependable sessions, answer handling and long-term progress | Planned |
| 4 | Improve targeted practice and learner-designed sessions within the approved design | Planned; visual changes require permission |
| 5 | Supported hosting, release process and ongoing maintenance | Partly prepared in Phase 1; hosting decision outstanding |

## Phase 1 — Reliable content and editing foundations

### 1A. One content contract

Use the actual live registry, covering manual files, course-derived sources and topic packs. Share CSV/TSV parsing, normalisation and structural validation between the browser loader, admin saves and release checks.

Reject malformed records, unexpected/ambiguous columns, missing authored IDs/base/answer/outcome, invalid outcomes, missing prompt structure, empty answer variants and globally duplicated IDs. Report source, record and ID where available. Do not generate an answer to hide a missing authored value, or interpret an unknown outcome as no mutation.

Report missing category, level, dialect, rule reference, translation and explanation as **editorial warnings**. Existing incomplete content stays available. Do not invent a syllabus level or a linguistic review status to make validation pass. Phase 2 supplies the evidence and classification necessary for dependable filtering.

Repair the malformed Unit 2 CSV quoting while preserving its 65 cards and original text. The wrong-language and inaccurate explanations still need editorial correction.

**Acceptance:** all six live sources and all 3,499 cards load with unique IDs and no structural errors. Broken fixtures fail with useful diagnostics. Builds validate the registered data automatically and CI checks before deployment. Passing validation does not claim linguistic correctness.

### 1B. Safe editing and canonical persistence

Existing TSV uses literal quotes; tabs and line breaks inside a cell are rejected rather than escaped inconsistently. Standard CSV supports quoted commas, quotes and multiline fields. Reader and writer must agree on every cell.

An unchanged form preserves the source bytes. A changed form must validate, round-trip and retain the same card identities before writing. Stage the file next to the source, flush it, keep a verified immutable backup, then replace atomically. Require the exact source hash the editor loaded; lock each source against concurrent writes. Reject stale edits rather than overwriting another correction.

Serve editable data from the same canonical directory that admin saves update. A fresh session must see a correction immediately, including after restart. Separate a persistent data directory from deployment files when hosted. Provide a restore command and test its ability to restore exact bytes while retaining a backup of the version it replaces.

Opening an editor must preserve the authored answer. Applying a helper suggestion is an explicit action, because the helper is not an authority for all Welsh constructions.

**Acceptance:** one edited TSV cell causes zero unrelated cell changes; Welsh characters and literal quotes survive; rejected content and failed writes preserve the original; simultaneous/stale writes conflict; save/reload/restart/restore pass in isolated fixtures at `/` and the project base path.

### 1C. Identity and progress

Rename only the five colliding Unit 2 IDs. Keep the Unit 1 IDs and all other IDs stable. Migrate attributable browser history to a versioned store; reset the five ambiguous legacy entries because their previous reviews cannot be assigned reliably to either card. Preserve the original v1 history untouched for recovery. Content hashes identify revisions, not learning identity.

Include source and revision in the existing report composer payload without changing its layout. For later substantive answer/rule changes, record an explicit progress-reset decision; typo fixes should normally retain progress.

**Acceptance:** identity survives sorting/filtering and ordinary text edits; migration is idempotent and handles malformed storage; reports carry enough provenance to find the reported version.

## Phase 2 — Welsh repair and full-bank organisation

1. Correct the known systematic errors first: the 38 `ff` to `f` cases, wrong-language Unit 2 explanations, mismatched base/answer pairs, article exceptions and unsupported mutation claims. Repair answers and explanations together.
2. Review the 792 place-name cards by name and construction: canonical Welsh form, accepted alternatives, internal articles, mutation, the matching `yn/ym/yng` form, sentence meaning and explanation. Include unchanged forms where that is the learning objective.
3. Triage the 132 helper disagreements. They are candidates, not 132 established errors: some concern valid exceptions or limitations in the helper. Do not bulk-rewrite the bank from that helper.
4. Review every source and rule/context family. Group repeated patterns for efficient review, then verify exceptions and varied sentences. Record the evidence behind decisions and the scope of each completed review.
5. Fill the metadata needed for useful sessions: minimum/suitable learner level, topic/context, mutation construction, dialect where meaningful, meaningful no-mutation contrasts, sentence translation and explanations. Preserve deliberate broader exposure beyond the syllabus. Separate unknown level from an asserted course level.
6. Map relevant coursebook sections to topics and constructions, recording edition, dialect and page/unit references. A topic can draw on several units or courses, and a unit may map to no session. Review the newly supplied books alongside the original Mynediad reference.
7. Review Welsh interface language and terminology. Any change affecting design or layout needs the owner's permission before implementation.

Keep a review ledger (card IDs, source version, issue, evidence, correction, reviewer/date and unresolved questions). Use workflow labels such as draft, machine-valid and Welsh-reviewed accurately; do not shrink the intended published scope to a permanently small approved subset. Stage corrections in reviewable batches while retaining the complete bank. If a specific unresolved card needs temporary restriction, document its ID and reason and discuss the effect on the learner pool rather than quietly removing a broad class of content.

**Acceptance:** all known systematic errors are corrected; the full bank has an explicit review/metadata status; level/topic filters are based on evidence; answers and variants are consistent with the teaching context; a suitably fluent reviewer checks linguistic claims before describing material as reviewed. Progress towards coverage is measurable by source and context family, not by raw card quantity alone.

## Phase 3 — Reliable sessions and progress

Give each presentation its own identity and explicit question/feedback/completed state. Commit each review exactly once. Define what checking, revealing, skipping, repeating, switching modes and reloading do to statistics and scheduling. Fix one-card/two-card sessions and double-click/keypress problems.

Separate short-session completion from long-term learning history. Define due/new/extra practice behaviour, retain session choices, and add progress export/import/reset before considering accounts or cloud sync. Track practice by context or rule when classification is ready.

Repair Welsh digraph handling and accepted-answer display. Distinguish a primary display form from accepted variants; preserve meaningful accents. Prevent empty submissions and invalid or single-option Tap questions. Do not use helper-generated distractors that teach malformed words.

**Acceptance:** each action has a tested scheduling effect; repeated events cannot inflate results; sessions finish or offer a deliberate continuation; history survives ordinary reloads; answer variants and Welsh digraphs behave correctly. Any additional controls or visible changes must receive design approval.

## Phase 4 — Targeted practice within the existing design

Two equally important routes: choose a useful topic/construction pack, or design a session using filters. Both should support an appropriate challenge level and a satisfying amount of practice. Examples include Mynediad-appropriate place names, a particular preposition, mixed nasal contexts, or a contrast session focused on avoiding over-mutation.

Prepare a catalogue/filter specification from Phase 2 metadata before changing controls. Define which filters combine, how unknown levels behave, how counts are calculated, what an empty result means and whether a selected pack can be refined. Do not let technical source files or unit numbers become mandatory learner navigation.

Bring the owner concrete proposals for actual usability/accessibility defects: keyboard activation, feedback announcements, focus around dialogs, mobile picker completion, Help access, long text and on-screen keyboard space. Preserve the established aesthetic and mobile interaction work. Do not assume decorative panels, card IDs, spacing or navigation should be removed or rearranged.

**Acceptance after approval:** English/Welsh and keyboard-only flows work at 320, 390, 768, 1024 and 1366 px, short heights and 200% zoom; verify a physical phone and a screen reader. Learners can target a difficulty and construct an appropriate session without a unit-by-unit obstacle course.

## Phase 5 — Hosting and maintenance with practical support

The existing static publishing route can keep serving learners while corrections are made locally and published through source control. Live browser editing on the hosted site needs a server with persistent data and revision storage. Phase 1 supplies a tested Node runtime; this is not a claim that a public server has been provisioned or secured for operation.

Before choosing a provider, explain the concrete options, ongoing cost, who maintains it, how edited data survives redeployment and how backup recovery works. Help the owner set up the selected option. Do not default to a self-managed VPS or deploy/buy anything without the relevant authorization. A public writable deployment also needs HTTPS, abuse-resistant login, backup retention and an off-machine backup, with a rehearsed recovery process.

Keep lint, source checks, tests and builds gating releases. Add browser/session regression checks as Phases 3–4 address those flows. Verify audio success/failure, navigation during playback, pronunciation and dialect. Finish the external dependency advisory scan when its specific metadata transfer is authorised. Do not treat the previously blocked scan as a clean result.

**Acceptance:** a fresh checkout is usable from the README; the selected deployment survives a release without losing corrections; maintenance and recovery are understandable to the owner; no release bypasses content validation.
