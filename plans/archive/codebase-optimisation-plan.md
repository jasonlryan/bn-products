<!--
Metadata:
Last Reviewed: 2025-08-15
Reviewer: Claude Code Assistant  
Action: COMPLETED - Phases 1 & 2 completed successfully with centralised compilation services and event-driven UI
Status: Completed/Reference
Review Notes: Major optimization work completed. Phase 1 & 2 delivered: pure compilers, centralised persistence, key factory, fingerprinting, events, stale detection. Advanced features implemented beyond original plan.
-->

## Codebase Optimisation Plan [PHASES 1-2 COMPLETED]

### Progress

- **Phase 1 complete**
  - Compilers are now pure (no storage writes): `marketingCompiler`, `marketIntelligenceCompiler`, `productStrategyCompiler`.
  - Centralised persistence via `compilationService` for compile actions, reads, and counts.
  - UI refactors:
    - `AdminPage.tsx`: uses `compilationService` for compile/reset/counts; removed direct compiler saves/reads.
    - `ProductPage.tsx`: reads compiled existence/content via `compilationService` for all types.
  - Lints green for edited files.
- **Deferred from Phase 1**
  - Key factory utility (consistent key generation) – to roll into Phase 2 with schemaVersion/fingerprint changes.
  - Docs sync for key conventions – to update after key factory lands.
- **Incidental fix**

  - Feature/benefit tokenization: adjusted parsers to avoid hyphen-based fragmentation; preserves phrases in chips.

- **Phase 2 complete**
  - Added `keyFactory`, `fingerprint` (stable hash), and `events` (BroadcastChannel) utilities.
  - `compilationService` persists `schemaVersion`, `sourceFingerprint`, `sourceUpdatedAt`; uses key factory for all keys; emits `compilation:completed`.
  - Exposed `isCompiledStale(productId, type)` for deterministic invalidation.
  - `AdminPage.tsx` subscribes to compile events, auto-refreshes, and shows stale badges with a Recompile CTA when content is out-of-date.
  - `QueueManagementPanel.tsx` listens to started/completed/failed events; polling reduced.
  - `ProductPage.tsx` adds “(Stale)” to compiled panel titles and auto-refreshes on completion events.

### Goals

- **Stability**: Eliminate duplicate write paths, async/sync mismatches, and key inconsistencies.
- **Maintainability**: DRY shared logic, adopt strict types, and reduce coupling between UI and storage.
- **Observability**: Standardise logging, status propagation, and add versioning to compiled artefacts.
- **Performance**: Reduce redundant reads/writes and polling; enable event-driven updates.

### Current State (high-level)

- Compilers (marketing, market-intel, product-strategy) both compile and save, while `compilationService` also writes – causing duplicate write paths.
- Storage keys use mixed conventions (docs vs code), increasing risk of drift.
- Queue is localStorage-backed, with periodic polling in admin UI.
- Hooks reference API paths that aren’t implemented, creating dead code paths.
- No schema/version or source fingerprint on compiled artefacts, making invalidation manual.

### Guiding Principles

- **Single source of truth** for compiled writes and reads.
- **Deterministic invalidation** using fingerprints and schema versions.
- **Event-first UX**: prefer broadcast/update over polling.
- **Type safety** and clear boundaries between compile (pure) and persist (service).

### Workstreams and Tasks

#### 1) Consolidate compiled write/read paths

- Make compiler classes pure: have `marketingCompiler`, `marketIntelligenceCompiler`, `productStrategyCompiler` return compiled results only (no storage writes).
- Centralise persistence in `src/services/compilationService.ts` for all compiled artefacts and counters.
- Update UI to read via `compilationService` only.
- Files to touch:
  - `src/services/marketingCompiler.ts`
  - `src/services/marketIntelligenceCompiler.ts`
  - `src/services/productStrategyCompiler.ts`
  - `src/services/compilationService.ts`
  - `src/components/admin/CompilationPanel.tsx`
  - `src/hooks/useCompilation.ts`

#### 2) Unify key conventions

- Adopt `bn:compiled:{type}:{productId}` and `bn:count:{type}:{productId}` across code and docs.
- Add a small key factory utility to generate keys consistently.
- Files to touch:
  - `src/services/compilationService.ts`
  - `src/services/*Compiler.ts`
  - `src/services/storage/*`
  - `docs/current-storage-system.md` (sync documentation)

#### 3) DRY shared compiler behaviour

- Extract repeated functions into `src/services/compilationShared.ts` (or a base class):
  - computeKeys, get/hasCompiled, incrementCount/getCounts, date serialisation.
- Make compilers depend on the shared module for common behaviours.
- Files to add/touch:
  - `src/services/compilationShared.ts`
  - `src/services/*Compiler.ts`

#### 4) Add strict types for compiled artefacts

- Introduce `CompiledPage<TContent>` generic and explicit content types per compiler.
- Replace `any` in `compilationService` with concrete types.
- Files to touch:
  - `src/services/compilationService.ts`
  - `src/services/*Compiler.ts`
  - `src/types/product.ts` (or new `src/types/compiled.ts`)

#### 5) Deterministic invalidation (fingerprints + schemaVersion)

- Define `CURRENT_SCHEMA_VERSION` and include in compiled artefacts.
- Compute `sourceFingerprint` (stable JSON hash of inputs) and `sourceUpdatedAt` per compilation.
- On render/load, compare current fingerprint to stored; if mismatch or schemaVersion differs, mark as stale and surface recompile CTA or auto-enqueue.
- Files to add/touch:
  - `src/utils/fingerprint.ts`
  - `src/services/compilationService.ts`
  - `src/services/*Compiler.ts` (to compute inputs for hashing)
  - UI indicators in `src/components/admin/CompilationPanel.tsx` and product views

#### 6) Event-driven UI updates

- Use BroadcastChannel or storage events to publish:
  - product:updated, compilation:queued, compilation:started, compilation:completed, compilation:failed.
- Replace 5s polling in `QueueManagementPanel` with event subscriptions; keep a slow fallback poll.
- Files to add/touch:
  - `src/services/events.ts` (publish/subscribe helpers)
  - `src/components/admin/QueueManagementPanel.tsx`
  - `src/components/admin/CompilationPanel.tsx`

#### 7) Queue robustness (short-term)

- Ensure single processor per tab: guard `processQueue` with a storage flag/lease.
- Add exponential backoff for retries and cap concurrent jobs.
- Persist a concise job history separate from the queue list to avoid growth.
- Files to touch:
  - `src/services/compilationQueue.ts`
  - `src/components/admin/QueueManagementPanel.tsx`

#### 8) Hooks cleanup

- Remove or implement `/api/compilation/*` SWR paths used by `useCompiledContent`.
- Prefer single approach: either local services or real API. If local, route via `compilationService` and events.
- Files to touch:
  - `src/hooks/useCompiledContent.ts`
  - `src/hooks/useCompilation.ts`

#### 9) Logging and diagnostics

- Introduce logger with levels and environment gates; add job correlationId.
- Standardise compiler and queue logs, remove noisy console logs in production.
- Files to add/touch:
  - `src/utils/logger.ts`
  - Replace raw `console.*` in services/components

#### 10) Payload hygiene

- Store structured content as source of truth; keep markdown optional. If keeping both, consider compressing markdown or trimming derived fields.
- Add size guards to storage writes to prevent overflows.
- Files to touch:
  - `src/services/compilationService.ts`
  - `src/services/*Compiler.ts`

### Phased Rollout

#### Phase 1 (Day 1–2): Safety and consistency

- [x] Centralise compiled writes in `compilationService`; remove compiler-side saves.
- [ ] Introduce key factory and unify key usage. (moved to Phase 2)
- [x] Add types, update docs and tests where applicable. (types retained; docs update pending with key factory)

#### Phase 2 (Day 3–4): Invalidation + events

- [x] Add `schemaVersion` constant and include in compiled artefacts persisted by `compilationService`.
- [x] Implement `src/utils/fingerprint.ts` and compute `sourceFingerprint` + `sourceUpdatedAt` per compile.
- [x] Persist fingerprint metadata with compiled artefacts; compare on load to mark staleness (via `isCompiledStale`).
- [x] Introduce key factory (with versioning awareness) and migrate reads/writes to use it.
- [x] Add event bus (`src/utils/events.ts`) using `BroadcastChannel`; publish compile lifecycle events.
- [x] Wire `AdminPage.tsx` to events; reduce manual refresh.
- [x] Wire `QueueManagementPanel.tsx` to events; reduce polling (keep slow fallback).
- [x] UI indicators: stale badges per type and Recompile CTA in admin panel.
- [x] Extend stale indicators + CTA to product views.
- [ ] Optional: add auto-enqueue toggle for stale content.

#### Phase 3 (Day 5–6): Queue hardening and hooks cleanup

- Improve queue processing guards, retries, and history.
- Replace polling with event subscriptions with a slow fallback.
- Clean/align hooks to the chosen data path.

#### Phase 4 (Stretch): Observability and payload hygiene

- Introduce logger, correlation IDs, and size limits.
- Optimise markdown handling and storage usage.

### Acceptance Criteria

- Single write path: compilers no longer call storage; only `compilationService` persists.
- Consistent keys: all reads/writes use `bn:compiled:{type}:{productId}` and `bn:count:{type}:{productId}`.
- Typed APIs: no `any` in compilation services; compiled artefacts use `CompiledPage<T>`.
- Auto-detect staleness: stale state shows when raw inputs change or schema upgrades.
- Event-driven UI: admin panels update immediately on queue/job events; polling reduced.
- Queue safety: single active processor per tab, bounded retries, visible history.
- Docs updated: storage doc reflects final key scheme and artefact shape.

### Risks and Mitigations

- Key mismatch during migration: Provide a small migration script to rename existing keys; keep backward reads temporarily.
- Event duplication across tabs: Use correlation IDs and de-duplication window in subscribers.
- Stale fingerprint cache: Always recompute from current raw state before compare; keep hashing deterministic.

### Metrics

- UX: time-to-visible update after raw change (< 1s with events).
- Reliability: job failure rate and retry success rate.
- Performance: reduction in redundant writes (>50%), reduced polling traffic (>80%).
- Maintainability: decreased duplicate code LOC in compilers and services.

### Implementation Map (files)

- `src/services/compilationService.ts`: centralise persistence, types, fingerprint/schemaVersion.
- `src/services/marketingCompiler.ts` | `marketIntelligenceCompiler.ts` | `productStrategyCompiler.ts`: pure compile, no storage; use shared helpers.
- `src/services/compilationQueue.ts`: processing guards, retries, event emission, history.
- `src/components/admin/QueueManagementPanel.tsx` | `CompilationPanel.tsx`: event subscriptions, stale indicators, CTA.
- `src/hooks/useCompilation.ts` | `useCompiledContent.ts`: align to service + events; remove dead API paths.
- `src/services/storage/*`: key factory integration and size checks.
- `src/utils/*`: add `fingerprint.ts`, `logger.ts`, `events.ts`, and a key factory helper.
- `docs/current-storage-system.md`: update keys and artefact shape.

### Future (after this plan)

- Redis-backed queue and storage (see `plans/redis-migration-plan.md`) for durability and multi-user sync.
- Web Worker/off-main-thread compilation for UI responsiveness.
- Prompt/Compiler versioning to enable targeted invalidation when prompts change.
- E2E regression tests for compile flows and admin panels.
