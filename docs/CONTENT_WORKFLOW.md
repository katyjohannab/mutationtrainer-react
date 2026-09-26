# Content workflow

Last updated: 2026-09-26

The goal is to correct and expand the full bank, with useful topic/construction sessions and learner-designed filters. Coursebook units are references; do not manufacture a pack for every unit. Read the [agreed plan](IMPROVEMENT_PLAN.md) first.

## Authoring and review

1. Identify a learner need and mutation context, including unchanged forms and meaningful dialect differences.
2. Gather relevant coursebook/grammar evidence. Record page, edition, level and dialect without assuming that one unit equals one session. Broad practice beyond the books is encouraged when the Welsh is supported.
3. Author CSV or literal-quote TSV with globally unique stable card IDs, base, answer, outcome and a clear answer gap. Use `Before`/`After`, `SentenceWithGap` with one `[]` marker, or a template with one `{answer}` marker. Accepted variants use `|` and must be deliberate.
4. Include accurate translations, English and Welsh explanations and suitable category/level/dialect metadata. The validator reports existing omissions; it cannot judge linguistic correctness. Maintain a review ledger rather than treating an automatically generated label as approval.
5. Register thematic source files/packs in `src/data/packRegistry.js`. Existing course-derived sources are registered in `src/data/dysguUnitRegistry.js`; both feed `src/data/csvSources.js`. Keep existing lowercase unit filenames if using that storage convention. Do not automatically scan every file into the learner bank.
6. Validate the complete registered bank and review the diff. Correct content in small traceable batches; do not overwrite authored answers from the mutation helper.

Standard CSV columns:

```csv
CardId,RuleFamily,RuleCategory,Trigger,Base,Translate,WordCategory,Before,After,Answer,Outcome,TranslateSent,Why,Why-Cym
```

Recognised aliases/metadata are in `src/services/csvFieldMap.js`. Unknown columns or conflicting aliases are rejected. Outcomes are `SM`, `NM`, `AM`, `NONE` or their canonical names. CSV fields containing commas, quotes or line breaks must be quoted/escaped correctly. In the existing TSV format quotes are literal; embedded tabs/newlines in cells are rejected.

The protected manual files remain `cards.tsv`, `prep.csv` and `article-sylfaen.csv`. Preserve them unless making specific authorised reviewed corrections. Retain the full bank and record unresolved editorial issues; do not silently reduce it to a small starter set.

## Safe editing

Use the existing local admin editor for supported cell corrections. Opening a card preserves its authored answer. Saves require the loaded source revision and retain a verified backup before atomic replacement. For new sources, ID changes or metadata schema work, use source-controlled edits and whole-bank validation. See [the runbook](DEPLOY_ADMIN_MODE.md) for conflicts and restoration.

```text
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm test -- --run
npm run build
```

`node scripts/verify-csv-sources.cjs --json` gives per-record diagnostics and source hashes. The generator in `src/content-gen/` is parked. Generated markdown is an artifact, not the current process specification.
