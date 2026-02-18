# Project Status: Mynediad & Cumulative Review Implementation

## Completed Features
- **Master CSV Pipeline**: `mynediad-master.csv` created to hold all Mynediad course content.
- **Unit 1 Content**: Populated `mynediad-master.csv` with:
  - Vocabulary (Time of day, basic verbs, greetings).
  - Phrases (Sut dych chi, Pwy dych chi?).
  - Numbers 0-10.
  - Incidental vocabulary drills (Outcome: None).
- **Cumulative Review Logic**:
  - Added "Review Block" units to `courses.js` (e.g., "Review Units 1–8").
  - Configured `criteria` to accept arrays of units (e.g., `["1", "2", ... "8"]`).
- **UI Improvements**:
  - `FiltersPanel.jsx` now groups units by Section (`block1`, `block2`, etc.).
  - Added visual styling for "Cumulative Review" buttons (dashed border, distinct background).
- **Sentence Context Fix**: Updated `mynediad-master.csv` to include fully populated `Before` and `After` columns (derived from Trigger), ensuring complete sentence context appears in the UI instead of just the trigger/base pair.

## Next Steps
- **Populate Units 3 & 4**: 
  - Decision made to focus on these units next.
  - **Comprehensive Coverage Strategy**: Use a "PDF Extraction -> Drill Generation" workflow to ensure no vocabulary or patterns are missed.
- **Future Requirements**:
  - **Preposition Trainer**: Dedicated mode for learning preposition mutations.
  - **Plurals**: Logic/drills for singular/plural forms.
- **Rules Integration**: Ensure specific mutation rules for Mynediad (e.g. Soft Mutation patterns in Unit 4) are correctly mapped in `RuleId`.
- **Testing**: Verify that "Review Units 1–8" correctly pulls cards from Unit 1 and (future) Unit 2-8.

## Technical Notes
- **CSV Structure**: `CardId,Unit,RuleId,Trigger,Base,Before,After,Answer,Outcome,Translate,TranslateSent,Category,Family`.
- **Course Definition**: `src/data/courses.js` uses `section` property for grouping and `isCumulative` for styling.
