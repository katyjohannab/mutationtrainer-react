# Hyfforddwr Treiglad (Welsh Mutation Trainer) - AI Agent Instructions

## Project Overview
React/Vite flashcard trainer for Welsh language mutations. Bilingual (Welsh/English) with CSV-based card data, spaced repetition (Leitner system), preset packs, and dynamic filtering. Deployed to GitHub Pages at https://katyjohannab.github.io/mutationtrainer-react/

## Architecture

### State Management
- **Global state**: [src/state/TrainerContext.jsx](../src/state/TrainerContext.jsx) (legacy, being phased out)
- **Main app state**: [src/App.jsx](../src/App.jsx) manages card data, filters, modes, session stats
- **LocalStorage keys** (versioned for migration safety):
  - `wm_active_preset`: Selected preset pack ID
  - `wm_mode`: "random" | "smart" (Leitner-based)
  - `wm_leitner_v1`: Map of `cardKey → { box, dueAt, lastReviewedAt, ... }`

### Data Flow
1. **CSV Loading**: [src/services/loadCsv.js](../src/services/loadCsv.js) → parses multiple CSVs from [public/data/](../public/data/) using PapaParse
   - Normalizes headers (case-insensitive, e.g., "CardId"/"cardId"/"id" → `cardId`)
   - Adds `__source` field tracking origin file
2. **Filtering**: [src/utils/applyFilters.js](../src/utils/applyFilters.js) → applies preset rules (triggers, categories, sourceScope) + user filters (families, categories)
   - Uses `canon()` function: lowercase + alphanumeric only (`"Place Names" → "placenames"`)
3. **Card Selection**:
   - **Random mode**: [src/utils/pickNext.js](../src/utils/pickNext.js) → avoids recent repeats via `recentRef`
   - **Smart mode**: Picks most overdue card from Leitner system
4. **Answer Checking**: [src/utils/checkAnswer.js](../src/utils/checkAnswer.js) → handles pipe-delimited alternatives (`"fy nghi|nghi"`)
5. **Spaced Repetition**: [src/utils/leitner.js](../src/utils/leitner.js) → 5-box system with intervals (10m, 1h, 1d, 3d, 7d)
6. **Grammar & Choice Generation**: [src/utils/grammar.js](../src/utils/grammar.js) → Core mutations logic (apply mutation rules) and multiple-choice distractor generation algorithms.

## Key Conventions

### Component Organization
- **shadcn/ui components**: [src/components/ui/](../src/components/ui/) (Radix-based, v4 with CSS variables)
- **Feature components**: Top-level in [src/components/](../src/components/)
- **Import alias**: `@/` maps to `src/` (configured in [vite.config.js](../vite.config.js))

### Styling
- **Tailwind v4** with `@tailwindcss/vite` plugin
- **CSS variables** for theming in [src/index.css](../src/index.css)
- **Icons**: Lucide React (consistent with shadcn)

### Internationalization (i18n)
- **Context**: [src/i18n/I18nContext.jsx](../src/i18n/I18nContext.jsx) provides `{ t, lang, setLang }`
- **Strings**: [src/i18n/strings.js](../src/i18n/strings.js) → `STRINGS.cy` (Welsh), `STRINGS.en` (English)
- **Usage**: `t("keyName")` in components (never hardcode user-facing text)

## Development Workflows

### Running Locally
```bash
npm install          # Fresh install
npm run dev         # Dev server (http://localhost:5173)
npm run build       # Production build → dist/
npm run preview     # Preview production build
npm run lint        # ESLint check
```

### Deployment
- **Auto-deploy**: Push to `main` → GitHub Actions ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)) builds and deploys to GitHub Pages
- **Critical config**: `base: '/mutationtrainer-react/'` in [vite.config.js](../vite.config.js) for correct asset paths
- **Jekyll bypass**: `public/.nojekyll` prevents GitHub Pages Jekyll processing

### Adding/Modifying Cards
1. Edit CSV in [public/data/](../public/data/) (e.g., `cards.csv`, `prep.csv`, `article-sylfaen.csv`)
2. Update [src/data/csvSources.js](../src/data/csvSources.js) if adding new files
3. Card schema (flexible, normalized on load):
   - `cardId`: Unique identifier
   - `family`, `category`: For filtering
   - `trigger`, `base`: Trigger word/context
   - `before`, `after`, `answer`, `outcome`: Sentence structure + correct answer
   - `translate`, `translateSent`: English translations
   - `why`, `whyCym`: Explanations (English/Welsh)

## Critical Patterns

### Answer Checking
- **Always use** [src/utils/checkAnswer.js](../src/utils/checkAnswer.js) → handles multiple acceptable answers
- **Normalization**: `norm()` trims, lowercases, collapses whitespace
- **Never** reimplement answer comparison logic

### Mutation Logic
- **Always use** [src/utils/grammar.js](../src/utils/grammar.js) for mutation rules and multiple-choice generation.
- **Never** hardcode mutation rules (soft/nasal/aspirate mappings) inside UI components.

### Leitner Box Updates
```javascript
import { updateLeitner } from '@/utils/leitner';
// result: "correct" | "wrong" | "revealed" | "skipped"
// options.ease: "easy" | "again" (optional, for smart mode buttons)
const newMap = updateLeitner(leitnerMap, cardKey, result, { ease: "easy" });
```

### Filter Canonicalization
- **Always use** `canon()` from [src/utils/applyFilters.js](../src/utils/applyFilters.js) when comparing categories/families
- Example: `canon("Place Names") === canon("placenames") → true`

### Session Stats
- Centralized in [src/App.jsx](../src/App.jsx): `{ attempted, correct, streak, bestStreak }`
- Update on every answer check (increment `attempted`, `correct`, update `streak`)

## Common Tasks

### Adding a Preset Pack
1. Add entry to [src/data/presets.js](../src/data/presets.js) `PRESET_DEFS`:
   ```javascript
   "new-preset": {
     id: "new-preset",
     titleKey: "preset.newPreset.title",      // i18n key
     descriptionKey: "preset.newPreset.desc",
     sourceScope: ["file.csv"],               // Optional: limit to specific CSV
     category: "CategoryName",                // Optional: filter by category
     triggers: ["word1", "word2"],            // Optional: filter by trigger words
   }
   ```
2. Add to `PRESET_ORDER` array
3. Add i18n strings to [src/i18n/strings.js](../src/i18n/strings.js) under both `cy` and `en`

### Adding shadcn/ui Component
```bash
npx shadcn@latest add <component-name>
```
- Components install to [src/components/ui/](../src/components/ui/)
- Config: [components.json](../components.json) (New York style, CSS variables)

### Debugging Card Issues
- Enable debug panel: `<DebugPanel />` in components shows current card data
- Check CSV normalization in browser console: `row.__source` field shows origin file
- Verify filter logic: Add `console.log` in [src/utils/applyFilters.js](../src/utils/applyFilters.js) `applyFilters()` function

## Code Quality Standards
See [src/DEFINITION_OF_DONE.md](../src/DEFINITION_OF_DONE.md) for full criteria:
- **No duplicate logic**: Centralize in utils (e.g., `checkAnswer`, `applyFilters`, `canon`)
- **LocalStorage migrations**: Version keys (`_v1` suffix) when changing structure
- **TypeScript**: `.tsx` for new components (gradual migration from `.jsx`)
- **Accessibility**: Use semantic HTML, ARIA labels on icon buttons, keyboard navigation
