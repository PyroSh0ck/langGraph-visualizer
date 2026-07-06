# BUILD_PLAN.md — langgraph-visualizer frontend expansion

> Working spec for a large, multi-feature build. This is the source of truth to reload
> instead of re-deriving context. Everything here targets **Next.js 16 (App Router,
> React 19), Tailwind v4 (CSS-first), Prisma 7 + Neon Postgres, shadcn/ui**.
> Aesthetic: **barebones, early-2000s**. Structure only — no gratuitous color, borders,
> rounding, shadows, or hover effects.

## 0. Current state (as of writing)

- **Pages:** `/` (barebones prompt list), `/promptCreation`, `/promptCompare`, `/promptPlayground/[promptId]`.
- **API routes:** `/api/prompts`, `/api/versions`, `/api/runs` — each a collection `route.ts`
  (GET list + POST) and `[id]/route.ts` (GET/PATCH/DELETE).
- **lib:** `prisma.ts` (client singleton), `apiHandlers.ts` (`listRecords` + `errorResponse`),
  `apiClient.ts` (client fetch helpers).
- **Schema:** `Prompt`, `Version`, `Run`, workflow/eval/tool models. Org/auth models removed.
  Single-tenant. `Prompt.Name` is globally `@unique`.
- **NOT installed yet:** shadcn/ui, `react-hook-form` (imported by pages but missing from
  `package.json`), `zod`. `@xyflow/react` IS installed.
- **Known data quirk to fix:** the versions POST stores `Version_Messages` as
  `JSON.stringify({message})` (a JSON *string*). New message model stores a real JSON
  **array** — see §4.

---

## 1. Feature scope (what we are building)

1. **Overall Prompt Viewer** and **Overall Run Viewer** — filterable by prompt name and
   creation date. Embedded on Home; full versions on `/prompts` and `/runs`.
2. **Left navbar** — Home, All Prompts, All Runs, Compare.
3. **Prompt/Version comparison** (`/compare`), expanded:
   - Compare two **prompts** OR two **versions** (selectable comparison mode).
   - Each side picks a **model** (from a static JSON model list).
   - **Side-by-side output panels**; per-side **score + notes**; each side **savable as a Run**.
   - Clicking **Run creates two Run objects** (one per side).
4. **Model type stored on Run** — reuse existing `Model_Company` (ProviderType) + `Model_Name`.
   No new Run column; both are populated from the chosen model option.
5. **`Preferred_Model` field on Version** — new nullable column + migration.
6. **Prompt edit page** — list all versions of the prompt; select any version as the
   **best current version** (PATCH `Prompt.Best_Version_Id`).
7. **Multi-model benchmark page** (`/benchmark`) — run one prompt across multiple models;
   compare **output quality, speed, token usage, estimated cost, formatting accuracy,
   consistency**. Unknown metrics are **manual user inputs** (quality /10, formatting /10,
   consistency /10). Each model row is savable as a Run.
8. **Message table editor** — ordered rows, each a `systemMessage` or `humanMessage` with
   content; the array becomes the LangChain message array. Replaces the single `message` field.
9. **Tools / Response schema / Context schema editors:**
   - **Tools:** multi-select dropdown sourced from a static JSON tool object → stored in
     `Version.Bound_Tools` (uuid string array).
   - **Response schema / Context schema:** JSON textareas, **validated** against LangChain
     `ResponseSchema` / `ContextSchema` shape (see §9). Stored in `Version.Response_Schema` /
     `Version.Context_Schema` (Json).
10. **shadcn/ui everywhere**, barebones.

---

## 2. File layout / structure (target)

```
frontend/
  components.json                     # shadcn config (new)
  docs/BUILD_PLAN.md                  # this file
  prisma/
    schema.prisma                     # + Version.Preferred_Model
    migrations/<ts>_add_preferred_model/
  src/
    app/
      layout.tsx                      # root layout (fonts, globals)
      (dashboard)/                    # route group sharing the sidebar layout
        layout.tsx                    # <AppSidebar/> + <main>{children}</main>
        page.tsx                      # HOME: embedded PromptViewer + RunViewer
        prompts/
          page.tsx                    # All Prompts (full PromptViewer + New button)
          new/page.tsx                # Prompt creation (editor form)
          [promptId]/page.tsx         # Prompt edit page (versions list, editor)
        runs/
          page.tsx                    # All Runs (full RunViewer)
        compare/
          page.tsx                    # Prompt/Version comparison
        benchmark/
          page.tsx                    # Multi-model benchmark
      api/
        prompts/route.ts, [id]/route.ts
        versions/route.ts, [id]/route.ts
        runs/route.ts, [id]/route.ts
    components/
      ui/                             # shadcn primitives (generated)
      app-sidebar.tsx
      viewers/
        prompt-viewer.tsx
        run-viewer.tsx
        filter-bar.tsx
      editor/
        message-list-editor.tsx
        tools-select.tsx
        schema-editor.tsx
        model-select.tsx
        version-list.tsx
      compare/
        compare-column.tsx
        output-panel.tsx
        score-notes.tsx
      benchmark/
        benchmark-table.tsx
        benchmark-row.tsx
    lib/
      prisma.ts                       # (server)
      apiHandlers.ts                  # listRecords (extended), errorResponse
      apiClient.ts                    # fetch helpers (extended)
      utils.ts                        # cn() + formatters (new)
      models.ts                       # static model JSON list (new)
      tools.ts                        # static tools JSON object (new)
      messages.ts                     # Message (de)serialization (new)
      schema-validation.ts            # zod validators for response/context schema (new)
      types.ts                        # shared client types (new)
    hooks/
      use-prompts.ts
      use-runs.ts
      use-prompt.ts
      use-versions.ts
      use-async-action.ts             # generic submit/loading/error wrapper
```

> Routing note: rename `/promptCreation` → `/prompts/new`, `/promptCompare` → `/compare`,
> `/promptPlayground/[promptId]` → `/prompts/[promptId]`. Keep the old files only until the
> new ones are wired, then delete.

---

## 3. Data model & migration changes

### 3.1 Version
- **Add** `Preferred_Model String?` (nullable; a model id from `lib/models.ts`).
- `Version_Messages` (Json) now holds an **array** `Message[]` (see §4) — no column change,
  but fix the POST route to store the array directly (stop `JSON.stringify`-ing it).
- `Bound_Tools String[] @db.Uuid` — populated by ToolsSelect.
- `Response_Schema`, `Context_Schema` (Json) — populated by SchemaEditor (validated).

Migration: `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
--script -o prisma/migrations/<ts>_add_preferred_model/migration.sql` then
`prisma migrate deploy` (migrate dev is non-interactive-hostile in this env — see §12).

### 3.2 Run (no schema change)
Populate on create:
- `Model_Company` (ProviderType), `Model_Name` (string) ← chosen model option.
- Metrics columns: `Speed`, `Input_Tokens`, `Output_Tokens`, `Estimated_Cost`,
  `Formatting_Accuracy`.
- `Output_Quality` (Json) shape (manual-graded fields live here):
  `{ score: number, consistency: number, notes: string }`.
- `Model_Output` (Json): `{ text: string }` (placeholder until execution exists).
- `Status`/`Status_Message`: `"Success"` / placeholder note.

---

## 4. Messages model (§8 feature)

`lib/types.ts`:
```ts
export type MessageRole = "system" | "human";
export type Message = { role: MessageRole; content: string };
```
- UI: `message-list-editor.tsx` — a table; each row = `Select(role)` + `Textarea(content)` +
  remove; an "Add message" button; optional up/down reorder. Order is significant.
- `lib/messages.ts`:
  - `serializeMessages(messages: Message[]): Message[]` (identity/normalize; ensures array).
  - `deserializeMessages(value: unknown): Message[]` (parses legacy stringified value,
    tolerates `{message}` legacy shape → single human message, returns `[]` on garbage).
  - `toLangChain(messages)` (future): map `system`→SystemMessage, `human`→HumanMessage.
- **Fix versions POST** to store `Version_Messages: messages` (array), not a stringified string.

---

## 5. Static JSON sources

- `lib/models.ts`:
  ```ts
  export type ModelOption = { id: string; label: string; provider: "OpenAI"|"Anthropic"|"Google"|"Custom"; model: string };
  export const MODELS: ModelOption[] = [ /* seed a handful; JSON list for now */ ];
  ```
- `lib/tools.ts`:
  ```ts
  export type ToolOption = { id: string; name: string; description: string };
  export const TOOLS: ToolOption[] = [ /* static object list for the dropdown */ ];
  ```
Both are placeholders that will later be replaced by DB/API-backed sources.

---

## 6. Route handlers (create/extend)

Existing collection + `[id]` routes stay. Changes:

### 6.1 Extend `listRecords` (lib/apiHandlers.ts) — filter engine
Replace the flat `filterKeys: string[]` with a **filter config** so viewers can filter by
name (contains), date range, and nested relation:
```ts
type FilterSpec =
  | { param: string; type: "eq"; column: string }
  | { param: string; type: "contains"; column: string }            // case-insensitive
  | { param: string; type: "date-gte"|"date-lte"; column: string }
  | { param: string; type: "contains"; relation: string; column: string }; // nested (e.g. prompt.Name)
listRecords(request, model, orderColumn, specs: FilterSpec[], include?: object)
```
- Build a Prisma `where` from present params; keep `id` short-circuit + pagination + order.
- `include` lets Run list embed `prompt` for display of prompt name.

### 6.2 Per-route filter specs
- **prompts** GET: `q`→contains `Name`; `createdAfter`→date-gte `Created_At`;
  `createdBefore`→date-lte `Created_At`.
- **runs** GET: `q`→contains nested `prompt.Name`; `createdAfter`/`createdBefore`→
  `Executed_At`; `Prompt_Id`/`Version_Id`→eq. Include `prompt` (id+Name).
- **versions** GET: `Prompt_Id`→eq (already).

No new route files are required unless a dedicated bulk endpoint is wanted for benchmark
(default: the client POSTs multiple runs sequentially via existing `/api/runs`).

---

## 7. lib/apiClient.ts additions

- `fetchPrompts(filters?)`, `fetchRuns(filters?)` — accept `{ q?, createdAfter?, createdBefore?, Prompt_Id? }`,
  build query string, return unwrapped `data`.
- `fetchVersions(promptId)`.
- `createRun(input)` — extend to accept `{ Prompt_Id, Version_Id, model: ModelOption,
  Output_Quality, Speed?, Input_Tokens?, Output_Tokens?, Estimated_Cost?, Formatting_Accuracy?, modelOutput? }`
  and map `model`→`Model_Company`/`Model_Name`.
- `createVersion(input)` — extend to send `messages: Message[]`, `preferred_model`,
  `bound_tools: string[]`, `response_schema`, `context_schema`.
- `updatePrompt(id, data)` (exists) — used for best-version selection.

---

## 8. Custom hooks vs utilities (stateful vs pure)

**Hooks (`src/hooks/`, stateful — data + loading/error):**
- `usePrompts(filters)` → `{ prompts, loading, error, refetch }`.
- `useRuns(filters)` → `{ runs, loading, error, refetch }`.
- `usePrompt(id)` → `{ prompt, refetch }`.
- `useVersions(promptId)` → `{ versions, refetch }`.
- `useAsyncAction()` → `{ run, pending, error }` generic wrapper for POST/PATCH submit buttons
  (replaces ad-hoc try/catch + alert).

**Utilities (`src/lib/`, pure):**
- `utils.ts`: `cn(...)` (clsx + tailwind-merge), `formatDate`, `formatCost`, `formatTokens`.
- `messages.ts`: (de)serialize (§4).
- `schema-validation.ts`: `validateResponseSchema`, `validateContextSchema` (§9).
- `models.ts`, `tools.ts`: static data (§5).

> No SWR/React Query — hooks use `useState`+`useEffect` against `apiClient`. If caching pain
> appears later, revisit; not in scope now.

---

## 9. Schema validation (§9 feature) — `lib/schema-validation.ts`

Use `zod`. Return `{ ok: true, value } | { ok: false, errors: string[] }`.

- **ResponseSchema** (LangChain `StructuredOutputParser.fromNameAndDescriptionPairs` shape):
  input must parse as JSON and be an **array of** `{ name: string (non-empty),
  description: string (non-empty), type?: string }`. Reject non-arrays, missing name/description,
  duplicate names.
- **ContextSchema** (LangChain state/context schema): input must parse as JSON and be an
  **object** whose values are field descriptors — accept either
  `{ [field]: "string"|"number"|"boolean"|"object"|"array" }` (simple typed map) or a
  JSON-Schema-like object `{ type, properties, required? }`. Reject arrays and primitives at root.
- SchemaEditor shows inline error text and blocks save while invalid.

---

## 10. Pages — layout (barebones)

All pages sit inside `(dashboard)/layout.tsx`: a **left sidebar** (`AppSidebar`) + a `<main>`
content column. Plain vertical stack, left-aligned, generous but unstyled.

- **Home `/`**: heading; two sections stacked — `PromptViewer` (compact, embedded) then
  `RunViewer` (compact, embedded). Each has its own `FilterBar` (name text input + two date
  inputs). Plain HTML `<table>` styled via shadcn `Table`.
- **All Prompts `/prompts`**: `FilterBar` + full `PromptViewer` table (columns: Name,
  Description, Created, Best Version, actions: Edit). "New Prompt" link to `/prompts/new`.
- **All Runs `/runs`**: `FilterBar` + full `RunViewer` table (columns: Executed, Prompt name,
  Model, Status, Speed, Tokens, Cost, Quality).
- **Prompt New `/prompts/new`**: form — Name, Description, `MessageListEditor`, `ModelSelect`
  (preferred model), `ToolsSelect`, two `SchemaEditor`s (response/context), sampling defaults
  (temp/top_p/max_tokens). Submit → create prompt + version + set best version.
- **Prompt Edit `/prompts/[promptId]`**: same editor prefilled from best version, PLUS a
  `VersionList` (all versions; radio/select to set best current version → PATCH). Save creates
  a new version. Run section (score/notes) → create Run.
- **Compare `/compare`**: top control = comparison **mode toggle** (Prompts | Versions). Two
  `CompareColumn`s side by side. Each column: a selector (prompt-or-version depending on mode)
  + `ModelSelect` + `OutputPanel` + `ScoreNotes` (score + notes) + "Save as Run". A single
  **Run** button at top runs **both** columns → creates **two Runs**.
- **Benchmark `/benchmark`**: pick one prompt/version + a set of models (multi-select). A
  `BenchmarkTable` with one `BenchmarkRow` per model; columns: Model, Output, Quality(/10 input),
  Speed(input), Input Tok(input), Output Tok(input), Est. Cost(input), Formatting(/10 input),
  Consistency(/10 input), Save Run. "Run all" creates a Run per row.

---

## 11. Color scheme / theme (barebones, 2000s)

shadcn theme via CSS variables in `globals.css` (Tailwind v4 `@theme`). **`--radius: 0`**,
no shadows, near-monochrome. Rules for all components: no `rounded-*`, no `shadow-*`, no
decorative `hover:` (only default link/underline affordance), no accent colors except the
classic link blue and a single status green/red for pass/fail if needed.

```
Background      #ffffff
Foreground/text #111111
Muted bg        #f0f0f0     (table header / zebra)
Border          #cccccc     (1px solid; tables, inputs)
Link            #0000ee     (visited #551a8b)  — default browser-ish
Accent (rare)   #dddddd
Radius          0
Font            system-ui / sans-serif (or existing Geist); monospace for JSON editors
```
Set shadcn `--primary` to near-black, `--ring` to a muted gray, `--radius: 0rem`. Keep light
mode only for now (no dark-mode theming required).

---

## 12. Dependencies & setup (do first)

1. `pnpm add react-hook-form zod clsx tailwind-merge` (rhf currently missing from package.json).
2. shadcn init (Tailwind v4 + React 19): `pnpm dlx shadcn@latest init` → creates
   `components.json`, `lib/utils.ts` (merge with our `utils.ts`), theme vars.
3. Add primitives: `pnpm dlx shadcn@latest add button input textarea select table
   dropdown-menu dialog tabs label separator sonner`. Use `sonner` toasts to **replace all
   `alert()`** calls (also unblocks browser-automation testing).
4. Prisma: add `Preferred_Model`, generate migration via `migrate diff` + `migrate deploy`
   (NOT `migrate dev` — it errors in this non-interactive env), then `prisma generate`.

---

## 13. Build sequencing (phases)

1. **Setup**: deps + shadcn + theme + `Preferred_Model` migration + `lib` utilities/statics.
2. **Backend**: extend `listRecords` filter engine + per-route specs + apiClient additions +
   fix `Version_Messages` array storage.
3. **Shared components**: `AppSidebar`, `FilterBar`, `PromptViewer`, `RunViewer`, hooks.
4. **Editor components**: `MessageListEditor`, `ModelSelect`, `ToolsSelect`, `SchemaEditor`,
   `VersionList`.
5. **Pages**: Home, `/prompts`, `/runs`, `/prompts/new`, `/prompts/[promptId]`.
6. **Compare** page + `CompareColumn`/`OutputPanel`/`ScoreNotes` (prompt & version modes,
   dual-run).
7. **Benchmark** page + table.
8. **Cleanup**: delete old routes/pages; typecheck; lint; end-to-end verify.

Each phase ends with a **validation pass** (§15) before the next begins.

---

## 14. Subagent roster (implementation agents)

Spawn per phase. **Default model: `haiku`, low reasoning effort.** Escalate to `sonnet` only
if a validation bot rejects the same deliverable twice. Each agent gets: this doc's relevant
section(s), the target file paths, and "barebones styling — obey §11".

| Agent | Model / effort | Responsibility |
|-------|----------------|----------------|
| `setup-agent` | haiku / low | Install deps, run shadcn init + add primitives, write theme vars (§11, §12). |
| `schema-agent` | haiku / low | Add `Version.Preferred_Model`; generate + apply migration; `prisma generate` (§3, §12). |
| `lib-agent` | haiku / low | `utils.ts`, `models.ts`, `tools.ts`, `messages.ts`, `types.ts`, `schema-validation.ts` (§4,5,9). |
| `api-agent` | haiku / low | Extend `listRecords` filter engine + per-route specs + apiClient; fix messages storage (§6,7). |
| `hooks-agent` | haiku / low | `use-prompts`, `use-runs`, `use-prompt`, `use-versions`, `use-async-action` (§8). |
| `viewer-agent` | haiku / low | `AppSidebar`, `FilterBar`, `PromptViewer`, `RunViewer`; Home/`/prompts`/`/runs` pages (§10). |
| `editor-agent` | haiku / low | `MessageListEditor`, `ModelSelect`, `ToolsSelect`, `SchemaEditor`, `VersionList`; new/edit pages (§10). |
| `compare-agent` | haiku / low → escalate sonnet | Compare page + columns, prompt/version modes, dual-run save (§10). Most complex; escalate if needed. |
| `benchmark-agent` | haiku / low | Benchmark page + table + manual-metric inputs + per-row run save (§10). |
| `cleanup-agent` | haiku / low | Remove old routes/pages, fix imports, run typecheck + lint. |

Coordination: run agents **in phase order** (§13); agents within a phase that touch disjoint
files may run in parallel (e.g. `lib-agent` ∥ nothing else in phase 1 after setup). Keep the
number spawned per turn small; do not re-spawn cold agents for work an existing one can continue.

## 15. Validation bots (all `haiku`)

After each phase, spawn a read-only validation bot (haiku, low effort) whose **only** job is
to check criteria and return PASS/FAIL + specifics. It must not edit code.

| Bot | Checks (FAIL if any unmet) |
|-----|----------------------------|
| `typecheck-lint-bot` | `pnpm exec tsc --noEmit` clean for new files; `pnpm exec eslint <changed>` 0 errors. |
| `schema-migration-bot` | `Version.Preferred_Model` present & nullable; a new migration exists and `prisma migrate status` = up to date; `prisma generate` succeeded; **no unintended** column/table drops in the migration SQL. |
| `filter-engine-bot` | `listRecords` handles eq/contains/date-range/nested; `id` short-circuit intact; pagination/order preserved; `where` applied to BOTH `findMany` and `count`; no filter param leaks unfiltered results (test bogus value ⇒ 0). |
| `messages-bot` | `Version_Messages` stored as a real JSON **array** (not a stringified string); `deserializeMessages` tolerates legacy `{message}` and garbage; role restricted to `system|human`. |
| `schema-validation-bot` | ResponseSchema validator: array of `{name,description,type?}`, rejects non-array / missing fields / dup names. ContextSchema validator: object root only, accepts typed-map and JSON-Schema-ish, rejects array/primitive root. Invalid input blocks save in UI. |
| `barebones-ui-bot` | Grep new components for banned classes: no `rounded-*` (radius must be 0), no `shadow-*`, no decorative `hover:*` (link underline only), no non-approved colors (palette §11). FAIL lists offending file:line. |
| `runs-integrity-bot` | Run creation sets `Model_Company`+`Model_Name` from chosen model; `Output_Quality` carries `{score,consistency,notes}`; compare Run creates exactly **two** runs; benchmark creates one run per selected model. |
| `nav-routing-bot` | Sidebar links resolve to `/`, `/prompts`, `/runs`, `/compare`; old routes removed; no dead imports; each page renders under the `(dashboard)` layout. |

Bot protocol: bot returns a short structured report (PASS/FAIL + file:line + one-line reason).
On FAIL, hand the report back to the owning implementation agent (same phase) to fix, then
re-run the bot. Two consecutive FAILs on the same item ⇒ escalate that agent to `sonnet`.

---

## 16. Conventions & guardrails

- **Field casing:** DB/Prisma fields are PascalCase (`Best_Version_Id`, `Default_Temperature`).
  Client form fields may be lowercase; map explicitly in route handlers / apiClient.
- **No `alert()`** — use `sonner` toasts (also keeps flows automatable).
- **Prisma migrations:** always `migrate diff` → write file → `migrate deploy` (never
  `migrate dev` here). Confirm no unintended drops before deploy.
- **Barebones styling is a hard rule** (§11) — enforced by `barebones-ui-bot`.
- **Verify end-to-end** after phase 8 by driving pages in-browser (override `window.alert`
  is no longer needed once toasts land) and asserting via `/api/*` reads: prompt CRUD,
  version-as-best selection, dual-run compare (2 runs), benchmark (N runs), schema validation
  rejects bad JSON. Clean up any test rows from Neon afterward.
- **Scope discipline:** model execution is still out of scope — runs store placeholder
  `Model_Output`/metrics except the manually-graded fields.
