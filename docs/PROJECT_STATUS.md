# Hyfforddwr Treiglad - Project Status Bible

> **Usage**: This file is the Source of Truth for the project state, standards, and roadmap.
> **Protocol**: All AI agents MUST read this file before suggesting major changes. Updates should be committed here after every significant feature implementation.

---

## 1. Core Philosophy & Non-Negotiables
*   **Educational Flexibility**: No "locked" levels. Users can dip in/out of any course/unit (Mynediad/Sylfaen/etc).
*   **Data Efficiency**: We do NOT store hardcoded answers or sentence outcomes. We rely on the `grammar.js` engine.
*   **Aesthetics**: 
    *   Cards must maintain aspect ratio (not wide/stubby).
    *   Typography must handle long Welsh words without breaking mid-word (overflow-wrap: break-word).
    *   Responsive Buttons: Touch targets must be thumb-friendly on mobile (>44px).
*   **Standards**:
    *   **UI Library**: shadcn/ui (Radix + Tailwind). Use `src/components/ui/`.
    *   **Icons**: Lucide React.
    *   **Colors**: CSS variables in `index.css` (e.g., `var(--cymru-green)`). Do not hardcode hex values.

---

## 2. Architecture & Data Workflow
### The "Lazy/Smart" Data Model
We have moved away from "Flat CSVs with Answers" to reasonable "Course Maps + Logic".

**The File Structure**:
1.  **Card Data** (`public/data/*.csv`):
    *   **Format**: `Trigger, Base, Outcome, Template, RuleId` (plus metadata).
    *   **Logic**: `loadCsv.js` calculates `Answer`, `Before`, `After` at runtime using `grammar.js`.
    *   **Rules**: `RuleId` maps to `src/data/rules.js` for rich, consistent explanations.
2.  **Curriculum Map** (`src/data/courses.js` - *Planned*):
    *   Maps cards to "Mynediad > Unit 1", etc.

### Data Generation Workflow (For User)
1.  **Source Material**: User uploads a PDF/Vocab list to Custom GPT.
2.  **GPT Task**: "Extract vocabulary and generate `test-lazy.csv`-style rows."
    *   *Input*: "Unit 1 Vocab"
    *   *Output JSON*: `[{ base: "bore", trigger: "good", ruleId: "adj-noun", template: "{trigger} {answer}!" }]`
3.  **App Load**: App sees the `template` and `ruleId`, generates the card.

---

## 3. Current Functionality Audit

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Logic Engine** | ✅ Done | `src/utils/grammar.js` handles soft/nasal/aspirate. 17/17 tests passing. |
| **Smart CSV Loader** | ✅ Done | Calculates missing answers. Parses templates. |
| **Explanation Rules** | ✅ Done | Markdown supported in "Why". Mapped from `rules.js`. |
| **Course UI** | ✅ Done | Integrated into Filter/Rail as "Courses" section. |
| **Lazy Test Pack** | ✅ Done | "Lazy CSV Test" pack proves the concept. |
| **Mobile UX** | ⚠️ Audit | Buttons need checking. Long words wrapping issue reported. |

---

## 4. UI/UX Standards Dictionary

### Components
*   **Buttons**:
    *   Primary Action: `<Button size="action" />` (Large, touch-friendly).
    *   Secondary: `<Button variant="ghost" />`.
    *   *Do not use standard HTML `<button>` tags for main actions.*
*   **Feedback Cards**:
    *   Use `PracticeCardFeedback.jsx`.
    *   Gradients: Use `bg-[image:var(--gradient-correct)]`, etc.
*   **Tyography**:
    *   Welsh Text: `font-medium text-foreground`.
    *   Explanations: `text-sm text-foreground/90` with Markdown parsing.

### Visual Glitches to Fix (Backlog)
- [ ] **Word Wrapping**: Long basewords are splitting mid-word. Need `break-words` or text resizing logic.
- [ ] **Card Aspect Ratio**: On wide screens, cards are stretching too wide. Lock `max-width`.
- [ ] **Mobile Touch Targets**: Ensure "Check" and "Reveal" buttons are easy to hit with thumbs.

---

## 5. Development Roadmap

### Phase 1: Foundation (Completed)
- [x] Refactor mutation logic to `grammar.js`.
- [x] Implement "Lazy CSV" loading (calc answers).
- [x] Add Rule Dictionary (`rules.js`).
- [x] Unit Tests for Grammar (`grammar.test.js`).

### Phase 2: Educational Layer (Next)
- [ ] Create `src/data/courses.js` (The Tree).
- [ ] Build `CoursesView.jsx` (The UI).
- [ ] Update Navigation to split "Practice" (Packs) vs "Learn" (Courses).

### Phase 3: UX Polish
- [ ] Fix text wrapping issues.
- [ ] Audit mobile responsiveness (touch targets).
- [ ] Implement "Course Progress" tracking (simple localStorage for now).
