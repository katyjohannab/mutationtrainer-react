Definition of Done: Hyfforddwr Treiglad (React/Vite migration)
0) Non-negotiables
The React app is a functional replacement for the existing GitHub Pages trainer UX (quick packs + filters, random/smart, hint/reveal/skip, hear, stats).
Code is clean, understandable, buildable:
npm install + npm run dev works from a fresh clone with no manual hacks.
npm run build succeeds and outputs a working production bundle.
ESLint passes (or is intentionally configured with documented exceptions).
No “mystery” globals, no duplicated logic across components.

A) Architecture & code quality (expansion-ready)
Aligned with plan “Project Structure” + “State Management Plan”.
Migration Plan_ Welsh Mutation …
Clear project structure (example acceptable):
src/components/* (UI components)
src/features/practice/* (practice modes + card engine)
src/features/filters/* (filters + packs)
src/services/tts/* (Polly client)
src/i18n/* (strings + language toggle)
src/data/* or public/data/* (CSV/JSON)
Single source of truth for card model (one normalised shape after parsing).
No duplicated answer checking logic: both practice modes call the same checkAnswer() and produce the same stats updates.
Key state is predictable and testable (React context or a small store, not prop spaghetti).
LocalStorage keys are versioned and documented (migration-safe).

B) UI library + design system (professional “Welsh” theme)
Aligned with plan recommendation to use Tailwind + a component/icon library.
Migration Plan_ Welsh Mutation …
Uses Tailwind properly (utilities + a small set of reusable component classes), not a growing pile of ad-hoc CSS.
Uses a real component library for interactive primitives (pick one, consistently):
Headless UI / Radix / shadcn-style components for: modal, tooltip, dropdown, tabs/toggles, drawer.
Uses an icon set consistently (Heroicons/FontAwesome etc) with accessible labels.
 Migration Plan_ Welsh Mutation …
Visual system is coherent:
“Pill” chips for packs + filters (selected/unselected/disabled states clearly distinct).
Cards look like cards (depth, border, spacing, contained feedback area).
Welsh theme feels sophisticated (not novelty): restrained palette, subtle gradients, clean typography.

C) Flashcard experience (the “card engine”)
Aligned with plan Step 4–5 on flashcard UI, actions, answer checking, feedback.
Migration Plan_ Welsh Mutation …
Card layout & behaviour
Card shows:
Instruction line (“Type the correct form…” equivalent).
The baseword prominently.
The sentence with a blank/input (before + answer slot + after).
Card ID visible somewhere (useful for “noticed an error”).
Progress (e.g. 1/479) and session indicators (accuracy/streak) like current site.
Buttons present and behave like the current site: Check, Hint, Reveal, Skip.
Keyboard: Enter triggers Check.
 Migration Plan_ Welsh Mutation …
Disabled states make sense (e.g. Check disabled if empty).
Feedback area:
Clear “Correct/Incorrect” message.
Correct answer is shown when wrong or revealed (no ambiguity).
“Why” area exists (even if v1 is simple/rule-based), consistent styling.
The “?” translation tooltip (baseword metadata)
There is a circular “?” button next to the baseword (styled like old app).
Hover shows a tooltip (desktop) containing:
English translation (gloss) of the baseword.
Part of speech metadata: noun-masc, noun-fem, plural, etc.
Mobile behaviour:
Tap opens the same content (tooltip/popover) and is dismissible.
Tooltip is built with a library primitive (not a fragile custom hover div).

D) Two practice modes (Type + Multiple Choice)
You want mode choice, but shared engine.
User can switch between:
Type the answer (input)
Multiple choice (3 options)
Both modes:
Use the same deck, filters, packs, random/smart scheduling, and stats tracking.
Share the same “Check/Reveal/Skip” semantics (adapted appropriately for multi-choice).
Multi-choice option generation is robust:
Always shows 3 distinct options where possible.
Has a fallback strategy for “no mutation” or duplicates.
Never shows an obviously broken set (e.g. three identical options).

E) Packs + filters (including “procured packs”)
Aligned with plan Step 6: packs implemented via config mapping to card IDs/criteria, and responsive filter UI.
Migration Plan_ Welsh Mutation …
Filters
Core filters work: mutation type + category (AND/OR logic behaves as documented).
 Migration Plan_ Welsh Mutation …
“Clear filters” truly resets to full deck.
Filter state is reflected cleanly in UI (selected pills, counts if needed).
Quick packs
Quick packs are shown at top and behave like the current site.
Selecting a pack:
Creates a deck restricted to that pack’s scope.
Visually highlights the active pack.
Does not leave misleading “selected” states in unrelated filters (your UX rule).
Procured packs (special constraint)
There is a pack configuration layer suitable for “procured” curated content:
Each procured pack only contains its contracted/approved card set.
Cards inside procured packs still appear in general browsing/filters.
Cards outside procured scope never leak into that procured pack.
Pack definitions are data-driven (JSON/config), not hard-coded in components.
 Migration Plan_ Welsh Mutation …

F) Random vs Smart mode (spaced repetition)
Aligned with plan Step 7 and the current site behaviour.
Migration Plan_ Welsh Mutation …
Random mode shuffles through the deck normally.
Smart mode:
Brings back mistakes sooner.
Lets mastered cards appear less frequently.
Does not get stuck or loop weirdly on small decks.
Optional (strongly preferred): basic persistence of mastery in localStorage.
 Migration Plan_ Welsh Mutation …

G) Engagement & retention (stats, streaks, mastery)
Aligned with plan Step 10 and current “More stats” approach.
Migration Plan_ Welsh Mutation …
Streak feature:
Current streak increments on correct, resets on wrong/reveal (rule documented).
Best streak tracked.
Stats panel (modal/drawer):
Session accuracy.
Correct / incorrect counts.
Deck progress (card index/total).
Mastery breakdown (at least basic: seen/correct/wrong; ideally by category/type).
Stats are legible and motivating, not clutter.

H) Amazon Polly TTS (essential)
Aligned with plan Step 8: endpoint-based, caching, error handling, UX feedback.
Migration Plan_ Welsh Mutation …
“Hear” button exists on the card and works across devices.
Implementation:
Uses a backend/Lambda/proxy so no AWS credentials ship to client.
 Migration Plan_ Welsh Mutation …
Shows a loading state while fetching audio.
Caches per card (memory and/or localStorage) to avoid repeated calls.
 Migration Plan_ Welsh Mutation …
Handles failures gracefully (message + no stuck spinner).
 Migration Plan_ Welsh Mutation …
Works when users tap repeatedly (cancels or queues sensibly).
 Migration Plan_ Welsh Mutation …

I) “Noticed an error” mechanism (essential)
“Noticed an error?” link/button is present on the card (like current UI pattern).
Clicking opens a modal or panel that:
Auto-includes Card ID, baseword, sentence, expected answer, and pack/filter context.
Lets user add a short free-text note.
Provides a reliable submission path:
Either opens a prefilled GitHub Issue (preferred), or
Sends to an endpoint, or
Copy-to-clipboard payload + instructions (fallback).
Does not require the user to manually find IDs.

J) Mobile-first usability (excellent intuitive mobile mode)
Aligned with plan’s “responsive filter UI” and current behaviour.
Migration Plan_ Welsh Mutation …
Core flows are excellent on mobile:
Card remains centred and readable.
Input is not hidden by the keyboard.
Primary actions are thumb-friendly.
Filters/pack panel on mobile:
Uses a drawer/sheet, not a cramped sidebar.
 Migration Plan_ Welsh Mutation …
“Apply/Close” behaviour is clear.
Tooltip “?” works via tap (not hover-dependent).
No layout jumps that feel broken (smooth transitions, sensible spacing).

K) Localisation (EN/CY toggle)
Aligned with plan localisation guidance and current bilingual tips.
Migration Plan_ Welsh Mutation …
Language toggle exists and is visible.
All UI strings switch (buttons, headings, pack descriptions, help text).
Any explanation/help content also switches (or has a clear “not available in Welsh yet” handling).
Language selection persists across sessions.

L) Testing, QA, deployment readiness
Aligned with plan Step 12 testing flows.
Migration Plan_ Welsh Mutation …
Manual QA checklist passes:
Select a quick pack, verify only those cards appear.
 Migration Plan_ Welsh Mutation …
Use filters in combination, verify logic and deck size behaves.
Random vs Smart behaves as expected.
Stats and streak update correctly.
“Hear” works repeatedly and on mobile.
Error reporting flow captures correct context.
Accessibility basics:
Keyboard navigation works for core actions.
 Migration Plan_ Welsh Mutation …
Buttons/inputs have labels/aria where needed.
 Migration Plan_ Welsh Mutation …
Deployed environment uses env vars safely (no API keys in client).
 Migration Plan_ Welsh Mutation …

Others
Onboarding/help modal and mechanism and is re-openable
An attractive header/tool bar
“Translate” feature for the base sentences
