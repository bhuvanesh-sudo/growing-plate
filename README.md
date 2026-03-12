# 🥦 GrowingPlate

**Children's food intake monitoring platform for parents and caregivers.**

GrowingPlate helps parents log their child's daily meals, visualize nutritional balance through an animated plate, and get evidence-based alerts when key nutrients fall short — all in a warm, friction-free interface designed to be used at the dinner table.

---

## What it does

- **Meal logging** — Log breakfast, snack, lunch, and dinner with a fast food search backed by Indian (ICMR) and global (USDA) nutritional data
- **Plate visualization** — An animated donut chart shows the day's food groups filling up in real time as meals are logged
- **Nutrient tracking** — Progress bars for calories, protein, carbs, fat, fiber, iron, and calcium compared against age- and sex-specific RDA targets
- **Smart alerts** — Color-coded severity system (green / yellow / orange / red) flags deficiencies and excesses with actionable food suggestions
- **Calendar view** — Monthly history of daily nutrition status with per-day meal breakdowns
- **Child profile** — Personalized targets computed from date of birth, sex, and activity level using ICMR 2020 / WHO reference tables

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| Charts | Recharts |
| Animations | Framer Motion |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Font | Nunito (Google Fonts) |

---

## Project structure

```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (app)/
      layout.tsx          # Auth-protected shell with navigation
      today/page.tsx      # Main daily log screen
      calendar/page.tsx   # Monthly nutrition history
      profile/page.tsx    # Child profile settings
    layout.tsx
    page.tsx              # Redirects to /today or /login
  lib/
    nutrition.ts          # Pure calculation engine (RDA lookup, alerts, plate data)
    supabase.ts           # Supabase client (browser)
    supabase-server.ts    # Supabase client (server)
  components/
    PlateVisualization.tsx
    FoodSearchModal.tsx
    NutrientBars.tsx
    AlertBanner.tsx
    MealSlot.tsx
    NavBar.tsx
  hooks/
    useTodayLog.ts
    useChild.ts
supabase/
  schema.sql              # Full DB schema + seed data
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier is sufficient)

### 1. Clone and install

```bash
git clone https://github.com/your-username/growingplate.git
cd growingplate
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Paste the contents of `supabase/schema.sql` and click **Run**
   - This creates all tables, seeds the food database (31 Indian + global foods), seeds RDA reference targets for ages 1–18, and configures Row Level Security
4. Go to **Project Settings → API** and copy your project URL and anon key

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> The service role key is used only in server-side routes. Never expose it to the browser.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be prompted to sign up and create your first child profile.

---

## Database schema

GrowingPlate uses a fully relational PostgreSQL schema with Row Level Security — parents can only ever access their own children's data.

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth users with name and locale |
| `children` | Child profiles (DOB, sex, activity level, allergies) |
| `foods` | Food database — 31 seeded items, expandable |
| `nutrient_targets` | RDA reference table for ages 1–18 (ICMR 2020 / WHO) |
| `daily_logs` | One row per child per day, stores pre-computed daily totals |
| `meals` | Four slots per day: breakfast, snack, lunch, dinner |
| `meal_items` | Individual food entries with computed nutrient values |
| `alerts` | Generated nutrient alerts with severity and suggestions |

All nutritional values are stored per 100g in the `foods` table and computed at insert time for each `meal_item`.

---

## Nutrition calculation engine

`src/lib/nutrition.ts` is a pure TypeScript library with no external dependencies. All nutritional math lives here — no inline calculations anywhere in the UI.

Key functions:

```typescript
// Convert display quantity + unit to grams
toGrams(quantity, unit, gramsPerPiece?)

// Compute nutrients for a food item at a given weight
calcNutrientsForItem(food, grams)

// Sum nutrients across multiple items
sumNutrients(items)

// Look up age + sex + activity level → daily RDA targets
getRDATargets(dob, sex, activityLevel)

// Compute per-nutrient alert severity (green / yellow / orange / red)
computeNutrientStatus(totals, targets)

// Overall day severity from all nutrient statuses
getOverallSeverity(statuses)
```

### Alert thresholds

| Severity | Condition | Meaning |
|---|---|---|
| 🟢 Green | 90–110% of target | On track |
| 🟡 Yellow | 60–89% or 111–130% | Mild under/over |
| 🟠 Orange | 40–59% or 131–150% | Needs attention |
| 🔴 Red | Below 40% or above 150% | Critical |

---

## Food database

The seed data covers common foods eaten by children in Indian and global households, sourced from:

- **ICMR 2020** (Indian Council of Medical Research) — roti, dal, idli, dosa, paneer, sambar, poha, upma, and more
- **USDA FoodData Central** — eggs, chicken, oats, fruits, vegetables, and packaged staples

The database is stored locally in PostgreSQL for instant search (< 200ms) without API rate limits. You can add more foods directly in the `foods` table at any time.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set the three environment variables in your Vercel project dashboard under **Settings → Environment Variables**. Vercel auto-detects Next.js — no configuration needed.

### Other platforms

Any platform that supports Next.js 14 works (Railway, Render, Fly.io). Make sure to set the environment variables and ensure the build command is `npm run build`.

---

## Roadmap

**Phase 1 — MVP (current)**
- [x] Authentication and child profile creation
- [x] Daily meal logging (4 meal slots)
- [x] Food search (local DB, 31 foods)
- [x] Plate visualization (donut chart by food group)
- [x] Nutrient progress bars with alert severity
- [x] Calendar view with daily status dots
- [x] Age-specific RDA targets (ICMR 2020 / WHO)

**Phase 2 — Growth**
- [ ] Multi-child support
- [ ] Barcode scanner (Open Food Facts API)
- [ ] Weekly analytics dashboard
- [ ] Push notifications and end-of-day reminders
- [ ] Meal templates for one-tap re-logging
- [ ] PDF nutritional report (for pediatrician visits)
- [ ] Expanded food database (500+ items)

**Phase 3 — Intelligence**
- [ ] AI food recognition from photos
- [ ] Personalized meal suggestions based on weekly patterns
- [ ] Predictive alerts for emerging deficiencies
- [ ] Pediatrician sharing portal (read-only link)
- [ ] Recipe URL logging with auto-nutrition extraction

---

## Nutritional disclaimer

GrowingPlate is not a medical device and does not provide medical advice. Nutrient targets are based on ICMR 2020 and WHO reference values and are intended as general guidance only. Always consult a qualified pediatrician or registered dietitian for medical concerns about your child's nutrition.

---

## License

MIT