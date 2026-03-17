# Agency OS Launch Studio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar una capa local de Agency OS en SanArte para que el repo pueda usarse como launch studio premium y cierre la app con disciplina de estrategia, direccion visual, build y QA.

**Architecture:** La implementacion agrega una capa local minima sobre el repo: skills especificas de stack y lanzamiento, reglas persistentes de workspace, un runtime operativo reproducible en `.antigravity/team/`, y herramientas de bootstrap para validar que todo este listo. El producto publicado no depende de esta capa; se usa para operar el trabajo que dejara SanArte launch-ready.

**Tech Stack:** Markdown, JSON, Node.js 20+, Node test runner (`node --test`), npm scripts, Antigravity project skills/rules, repo actual React 19 + TypeScript + Vite + Supabase.

---

### Task 1: Versioned Team Runtime Skeleton

**Files:**
- Create: `.antigravity/team/.gitignore`
- Create: `.antigravity/team/README.md`
- Create: `.antigravity/team/tasks.template.json`
- Create: `.antigravity/team/context/.gitkeep`
- Create: `.antigravity/team/summaries/.gitkeep`
- Create: `.antigravity/team/artifacts/.gitkeep`
- Create: `.antigravity/team/mailbox/.gitkeep`
- Create: `.antigravity/team/leases/.gitkeep`
- Create: `.antigravity/team/registry/.gitkeep`
- Create: `scripts/tests/agency-os.runtime-layout.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('team runtime template and ignore rules exist', () => {
  const ignore = fs.readFileSync('.antigravity/team/.gitignore', 'utf8');
  const template = JSON.parse(fs.readFileSync('.antigravity/team/tasks.template.json', 'utf8'));

  assert.match(ignore, /^tasks\.json$/m);
  assert.match(ignore, /^events\.jsonl$/m);
  assert.match(ignore, /^broadcast\.jsonl$/m);
  assert.match(ignore, /^mailbox\//m);
  assert.equal(template.version, 1);
  assert.deepEqual(template.tasks, []);
  assert.deepEqual(template.members, []);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/agency-os.runtime-layout.test.mjs"`
Expected: FAIL because the runtime layout files do not exist yet.

**Step 3: Write minimal implementation**

```gitignore
tasks.json
events.jsonl
broadcast.jsonl
mailbox/
leases/
artifacts/
```

```json
{
  "version": 1,
  "tasks": [],
  "members": []
}
```

```markdown
# Agency OS Team Runtime

Use `tasks.template.json` as the tracked seed. Generate `tasks.json` at runtime.
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/agency-os.runtime-layout.test.mjs"`
Expected: PASS with the tracked runtime skeleton in place.

**Step 5: Commit**

```bash
git add .antigravity/team scripts/tests/agency-os.runtime-layout.test.mjs
git commit -m "chore(agency): add versioned launch studio runtime skeleton"
```

### Task 2: SanArte Stack Skill Pack

**Files:**
- Create: `.agent/skills/stack-sanarte-supabase/SKILL.md`
- Create: `.agent/skills/stack-sanarte-supabase/resources/project-map.md`
- Create: `.agent/skills/stack-sanarte-supabase/resources/verification-commands.md`
- Create: `.agent/skills/stack-sanarte-supabase/resources/launch-gaps.md`
- Create: `scripts/tests/agency-os.stack-sanarte-skill.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('stack-sanarte skill documents the real stack and verification commands', () => {
  const skill = fs.readFileSync('.agent/skills/stack-sanarte-supabase/SKILL.md', 'utf8');
  const commands = fs.readFileSync('.agent/skills/stack-sanarte-supabase/resources/verification-commands.md', 'utf8');
  const gaps = fs.readFileSync('.agent/skills/stack-sanarte-supabase/resources/launch-gaps.md', 'utf8');

  assert.match(skill, /name: stack-sanarte-supabase/);
  assert.match(skill, /React \+ Vite \+ Supabase/);
  assert.match(commands, /npm run typecheck/);
  assert.match(commands, /npm run build/);
  assert.match(commands, /npm run doctor/);
  assert.match(gaps, /EXIF/i);
  assert.match(gaps, /robots\.txt/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/agency-os.stack-sanarte-skill.test.mjs"`
Expected: FAIL because the local stack skill files do not exist yet.

**Step 3: Write minimal implementation**

```markdown
---
name: stack-sanarte-supabase
description: Usa esta skill cuando trabajes dentro de SanArte y necesites contexto local sobre el stack React + Vite + Supabase + Vercel + Gemini, rutas clave, verificaciones y riesgos de lanzamiento.
---
```

```markdown
- `npm run typecheck`
- `npm run build`
- `npm run doctor`
- `node --test`
```

```markdown
- EXIF sanitization pending
- Missing `robots.txt`
- Missing `sitemap.xml`
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/agency-os.stack-sanarte-skill.test.mjs"`
Expected: PASS with the SanArte stack skill and resources documented.

**Step 5: Commit**

```bash
git add .agent/skills/stack-sanarte-supabase scripts/tests/agency-os.stack-sanarte-skill.test.mjs
git commit -m "feat(agency): add sanarte stack skill pack"
```

### Task 3: Launch Skill And Workspace Rules

**Files:**
- Create: `.agent/skills/launch-sanarte/SKILL.md`
- Create: `.agent/skills/launch-sanarte/resources/launch-readiness-checklist.md`
- Create: `.agents/rules/agency-os-governance.md`
- Create: `.agents/rules/sanarte-launch-standards.md`
- Create: `scripts/tests/agency-os.launch-governance.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('launch skill and rules enforce sacred noir launch workflow', () => {
  const skill = fs.readFileSync('.agent/skills/launch-sanarte/SKILL.md', 'utf8');
  const governance = fs.readFileSync('.agents/rules/agency-os-governance.md', 'utf8');
  const standards = fs.readFileSync('.agents/rules/sanarte-launch-standards.md', 'utf8');

  assert.match(skill, /launch-ready/i);
  assert.match(skill, /premium critique/i);
  assert.match(governance, /QA independiente/i);
  assert.match(standards, /2026-03-08-sacred-noir-design\.md/);
  assert.match(standards, /README\.md/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/agency-os.launch-governance.test.mjs"`
Expected: FAIL because the launch skill and workspace rules are not present yet.

**Step 3: Write minimal implementation**

```markdown
---
name: launch-sanarte
description: Usa esta skill para cerrar SanArte como producto launch-ready con premium critique, refinamiento visual, QA final y checklist de salida.
---
```

```markdown
- No cerrar una tarea importante sin QA independiente.
- Priorizar la skill mas especifica posible.
```

```markdown
- Respetar `docs/plans/2026-03-08-sacred-noir-design.md`.
- Actualizar `README.md` al cerrar cambios tecnicos.
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/agency-os.launch-governance.test.mjs"`
Expected: PASS with launch workflow and workspace rules captured locally.

**Step 5: Commit**

```bash
git add .agent/skills/launch-sanarte .agents/rules scripts/tests/agency-os.launch-governance.test.mjs
git commit -m "feat(agency): add launch workflow skill and workspace rules"
```

### Task 4: Bootstrap Doctor Command

**Files:**
- Create: `scripts/agency-os-doctor.mjs`
- Create: `scripts/tests/agency-os.doctor-contract.test.mjs`
- Modify: `package.json`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('package.json exposes agency doctor command', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(pkg.scripts['agency:doctor'], 'node scripts/agency-os-doctor.mjs');
});

test('doctor script checks launch studio essentials', () => {
  const script = fs.readFileSync('scripts/agency-os-doctor.mjs', 'utf8');
  assert.match(script, /stack-sanarte-supabase/);
  assert.match(script, /launch-sanarte/);
  assert.match(script, /agency-os-governance\.md/);
  assert.match(script, /mcp_config\.json/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/agency-os.doctor-contract.test.mjs"`
Expected: FAIL because the doctor script and npm command do not exist yet.

**Step 3: Write minimal implementation**

```javascript
const checks = [
  '.agent/skills/stack-sanarte-supabase/SKILL.md',
  '.agent/skills/launch-sanarte/SKILL.md',
  '.agents/rules/agency-os-governance.md',
  '.agent/mcp_config.json',
];
```

```json
{
  "scripts": {
    "agency:doctor": "node scripts/agency-os-doctor.mjs"
  }
}
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/agency-os.doctor-contract.test.mjs" && npm run agency:doctor`
Expected: PASS for the contract test and a readable doctor report listing present or missing launch studio files.

**Step 5: Commit**

```bash
git add package.json scripts/agency-os-doctor.mjs scripts/tests/agency-os.doctor-contract.test.mjs
git commit -m "feat(agency): add launch studio doctor command"
```

### Task 5: Seed The Launch Backlog

**Files:**
- Create: `docs/plans/2026-03-13-sanarte-launch-backlog.md`
- Create: `scripts/tests/agency-os.launch-backlog.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('launch backlog captures real blockers and premium workstreams', () => {
  const backlog = fs.readFileSync('docs/plans/2026-03-13-sanarte-launch-backlog.md', 'utf8');

  assert.match(backlog, /EXIF/i);
  assert.match(backlog, /robots\.txt/);
  assert.match(backlog, /sitemap\.xml/);
  assert.match(backlog, /monitoring/i);
  assert.match(backlog, /role-design-director/);
  assert.match(backlog, /role-qa-verifier/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/agency-os.launch-backlog.test.mjs"`
Expected: FAIL because the launch backlog artifact does not exist yet.

**Step 3: Write minimal implementation**

```markdown
# SanArte Launch Backlog

## Stream 1
- EXIF sanitization for avatar/image flow

## Stream 2
- `public/robots.txt`
- `public/sitemap.xml`

## Stream 3
- Monitoring and backups evidence

## Stream 4
- Premium refinement with `role-design-director` and `role-qa-verifier`
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/agency-os.launch-backlog.test.mjs"`
Expected: PASS with the launch backlog seeded from real repo evidence.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-13-sanarte-launch-backlog.md scripts/tests/agency-os.launch-backlog.test.mjs
git commit -m "docs(launch): seed sanarte launch backlog for agency os"
```

### Task 6: README Launch Studio Integration

**Files:**
- Modify: `README.md`
- Create: `scripts/tests/readme.agency-launch-studio.test.mjs`

**Step 1: Write the failing test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('readme documents agency os launch studio workflow', () => {
  const readme = fs.readFileSync('README.md', 'utf8');

  assert.match(readme, /Agency OS Launch Studio/);
  assert.match(readme, /npm run agency:doctor/);
  assert.match(readme, /launch-sanarte/);
  assert.match(readme, /stack-sanarte-supabase/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test "scripts/tests/readme.agency-launch-studio.test.mjs"`
Expected: FAIL because the README does not document the new launch studio workflow yet.

**Step 3: Write minimal implementation**

```markdown
## Agency OS Launch Studio

- Run `npm run agency:doctor`
- Use `stack-sanarte-supabase` for repo context
- Use `launch-sanarte` for final launch workflow
```

**Step 4: Run test to verify it passes**

Run: `node --test "scripts/tests/readme.agency-launch-studio.test.mjs"`
Expected: PASS with the workflow documented in the repo handoff.

**Step 5: Commit**

```bash
git add README.md scripts/tests/readme.agency-launch-studio.test.mjs
git commit -m "docs(readme): add agency os launch studio workflow"
```
