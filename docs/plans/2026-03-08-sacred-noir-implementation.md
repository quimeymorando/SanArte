# Sacred Noir Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar el rediseño Sacred Noir en el journey principal para que SanArte se perciba premium, coherente y emocionalmente irresistible en desktop y mobile.

**Architecture:** El rediseño se construye de afuera hacia adentro: primero tokens globales (color, tipografía, spacing, motion), luego primitives reutilizables, y finalmente adopción por pantallas críticas (`Landing`, `Home/Bento`, `Search/Detail`, `Upgrade`). La validación combina tests de contrato (presencia de tokens/estructuras clave), `typecheck`, `build` y smoke de rutas UX.

**Tech Stack:** React 19, TypeScript, TailwindCSS, CSS variables, Node test runner (`node --test`), Vite.

---

### Task 1: Foundation Tokens and Theme Contracts

**Files:**
- Create: `scripts/tests/sacred-noir.tokens.test.mjs`
- Modify: `index.css`
- Modify: `tailwind.config.js`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('sacred noir tokens exist in index.css', () => {
  const css = fs.readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  assert.match(css, /--sn-bg-obsidian:/);
  assert.match(css, /--sn-accent-gold:/);
  assert.match(css, /--sn-accent-cyan:/);
});

test('tailwind maps sacred noir colors', () => {
  const tw = fs.readFileSync(new URL('../../tailwind.config.js', import.meta.url), 'utf8');
  assert.match(tw, /'sn-obsidian'/);
  assert.match(tw, /'sn-gold'/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.tokens.test.mjs"`
Expected: FAIL because Sacred Noir tokens and mappings do not exist yet.

**Step 3: Write minimal implementation**

```css
:root {
  --sn-bg-obsidian: #07090f;
  --sn-surface: #111522;
  --sn-ink: #f3efe6;
  --sn-accent-gold: #c8a96b;
  --sn-accent-cyan: #72d7e7;
}
```

```javascript
extend: {
  colors: {
    'sn-obsidian': 'var(--sn-bg-obsidian)',
    'sn-gold': 'var(--sn-accent-gold)',
    'sn-cyan': 'var(--sn-accent-cyan)',
  }
}
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.tokens.test.mjs" && npm run typecheck && npm run build`
Expected: PASS + typecheck/build clean.

**Step 5: Commit**

```bash
git add scripts/tests/sacred-noir.tokens.test.mjs index.css tailwind.config.js
git commit -m "feat(design): add sacred noir tokens and theme contracts"
```

### Task 2: Shared Sacred Noir Primitives

**Files:**
- Create: `components/ui/sacred/SacredFrame.tsx`
- Create: `components/ui/sacred/SacredCard.tsx`
- Create: `components/ui/sacred/SacredButton.tsx`
- Create: `scripts/tests/sacred-noir.primitives.test.mjs`
- Modify: `components/ui/index.ts`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('sacred primitives export expected component names', () => {
  const indexFile = fs.readFileSync(new URL('../../components/ui/index.ts', import.meta.url), 'utf8');
  assert.match(indexFile, /SacredFrame/);
  assert.match(indexFile, /SacredCard/);
  assert.match(indexFile, /SacredButton/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.primitives.test.mjs"`
Expected: FAIL due to missing primitive exports.

**Step 3: Write minimal implementation**

```tsx
export const SacredCard = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <section className={`rounded-[28px] border border-sn-gold/20 bg-sn-surface/70 backdrop-blur-xl ${className}`}>{children}</section>
);
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.primitives.test.mjs" && npm run typecheck`
Expected: PASS for contract and typecheck.

**Step 5: Commit**

```bash
git add components/ui/sacred components/ui/index.ts scripts/tests/sacred-noir.primitives.test.mjs
git commit -m "feat(design): add sacred noir ui primitives"
```

### Task 3: Landing Sacred Noir Redesign

**Files:**
- Modify: `pages/LandingPage.tsx`
- Modify: `components/HeroSection.tsx`
- Modify: `components/TheShift.tsx`
- Modify: `components/OpportunitySection.tsx`
- Modify: `components/FinalCTA.tsx`
- Create: `scripts/tests/sacred-noir.landing-contract.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('landing uses sacred frame and premium hero markers', () => {
  const landing = fs.readFileSync(new URL('../../pages/LandingPage.tsx', import.meta.url), 'utf8');
  assert.match(landing, /SacredFrame/);
  assert.match(landing, /data-screen="landing"/);
  assert.match(landing, /Mistica Premium/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.landing-contract.test.mjs"`
Expected: FAIL because landing contract markers are absent.

**Step 3: Write minimal implementation**

```tsx
<SacredFrame data-screen="landing">
  <HeroSection tone="sacred-noir" />
</SacredFrame>
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.landing-contract.test.mjs" && npm run typecheck && npm run build`
Expected: PASS + successful build.

**Step 5: Commit**

```bash
git add pages/LandingPage.tsx components/HeroSection.tsx components/TheShift.tsx components/OpportunitySection.tsx components/FinalCTA.tsx scripts/tests/sacred-noir.landing-contract.test.mjs
git commit -m "feat(design): redesign landing experience in sacred noir"
```

### Task 4: Home and Bento "Personal Altar" Refactor

**Files:**
- Modify: `features/dashboard/BentoGrid.tsx`
- Modify: `pages/HomePages.tsx`
- Create: `scripts/tests/sacred-noir.home-contract.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('home and bento include sacred noir structure', () => {
  const bento = fs.readFileSync(new URL('../../features/dashboard/BentoGrid.tsx', import.meta.url), 'utf8');
  const home = fs.readFileSync(new URL('../../pages/HomePages.tsx', import.meta.url), 'utf8');
  assert.match(bento, /data-screen="altar-home"/);
  assert.match(home, /data-screen="home-main"/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.home-contract.test.mjs"`
Expected: FAIL because contracts are missing.

**Step 3: Write minimal implementation**

```tsx
<main data-screen="altar-home" className="sn-altar-layout">...</main>
```

```tsx
<div data-screen="home-main" className="sn-home-shell">...</div>
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.home-contract.test.mjs" && npm run typecheck && npm run build`
Expected: PASS + clean compile/build.

**Step 5: Commit**

```bash
git add features/dashboard/BentoGrid.tsx pages/HomePages.tsx scripts/tests/sacred-noir.home-contract.test.mjs
git commit -m "feat(design): refactor home and bento into personal altar layout"
```

### Task 5: Search, Detail, and Upgrade Premium Continuity

**Files:**
- Modify: `pages/HomePages.tsx`
- Modify: `pages/DetailPages.tsx`
- Modify: `pages/UpgradePage.tsx`
- Create: `scripts/tests/sacred-noir.flow-contract.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('core journey screens expose sacred noir data contracts', () => {
  const searchFile = fs.readFileSync(new URL('../../pages/HomePages.tsx', import.meta.url), 'utf8');
  const detailFile = fs.readFileSync(new URL('../../pages/DetailPages.tsx', import.meta.url), 'utf8');
  const upgradeFile = fs.readFileSync(new URL('../../pages/UpgradePage.tsx', import.meta.url), 'utf8');
  assert.match(searchFile, /data-screen="search-oracle"/);
  assert.match(detailFile, /data-screen="detail-oracle"/);
  assert.match(upgradeFile, /data-screen="upgrade-membership"/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.flow-contract.test.mjs"`
Expected: FAIL because screen contracts are not present.

**Step 3: Write minimal implementation**

```tsx
<section data-screen="search-oracle">...</section>
<section data-screen="detail-oracle">...</section>
<section data-screen="upgrade-membership">...</section>
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.flow-contract.test.mjs" && npm run typecheck && npm run build`
Expected: PASS + build success.

**Step 5: Commit**

```bash
git add pages/HomePages.tsx pages/DetailPages.tsx pages/UpgradePage.tsx scripts/tests/sacred-noir.flow-contract.test.mjs
git commit -m "feat(design): align search detail and upgrade with sacred noir journey"
```

### Task 6: Motion, Accessibility, and Final QA Sweep

**Files:**
- Modify: `index.css`
- Modify: `README.md`
- Create: `scripts/tests/sacred-noir.a11y-contract.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('reduced motion guard exists for sacred noir animations', () => {
  const css = fs.readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.a11y-contract.test.mjs"`
Expected: FAIL if reduced-motion policy is missing.

**Step 3: Write minimal implementation**

```css
@media (prefers-reduced-motion: reduce) {
  .sn-animate,
  .sn-ambient {
    animation: none !important;
    transition: none !important;
  }
}
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.a11y-contract.test.mjs" && npm run typecheck && npm run build && npm audit`
Expected: PASS across tests/build/audit.

**Step 5: Commit**

```bash
git add index.css README.md scripts/tests/sacred-noir.a11y-contract.test.mjs
git commit -m "feat(design): finalize sacred noir motion accessibility and qa"
```

### Task 7: Bitacora and Handoff Integrity

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-03-08-sacred-noir-design.md`
- Create: `scripts/tests/sacred-noir.bitacora-contract.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('readme bitacora includes sacred noir implementation session', () => {
  const readme = fs.readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  assert.match(readme, /Sesion .*sacred noir/i);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/sacred-noir.bitacora-contract.test.mjs"`
Expected: FAIL until the session entry is added.

**Step 3: Write minimal implementation**

```markdown
### Sesion YYYY-MM-DD (sacred noir fase X)
- Cambios realizados:
  - ...
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/sacred-noir.bitacora-contract.test.mjs" && git diff -- README.md`
Expected: PASS + readable operational handoff.

**Step 5: Commit**

```bash
git add README.md docs/plans/2026-03-08-sacred-noir-design.md scripts/tests/sacred-noir.bitacora-contract.test.mjs
git commit -m "docs: update sacred noir execution log and handoff state"
```
