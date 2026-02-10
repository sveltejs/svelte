# svelte

## 5.50.1

### Patch Changes

- fix: render boolean attribute values as empty strings for XHTML compliance ([#17648](https://github.com/sveltejs/svelte/pull/17648))

- fix: prevent async render tag hydration mismatches ([#17652](https://github.com/sveltejs/svelte/pull/17652))

## 5.50.0

### Minor Changes

- feat: allow use of createContext when instantiating components programmatically ([#17575](https://github.com/sveltejs/svelte/pull/17575))

### Patch Changes

- fix: ensure infinite effect loops are cleared after flushing ([#17601](https://github.com/sveltejs/svelte/pull/17601))

- fix: allow `{#key NaN}` ([#17642](https://github.com/sveltejs/svelte/pull/17642))

- fix: detect store in each block expression regardless of AST shape ([#17636](https://github.com/sveltejs/svelte/pull/17636))

- fix: treat `<menu>` like `<ul>`/`<ol>` for a11y role checks ([#17638](https://github.com/sveltejs/svelte/pull/17638))

- fix: add vite-ignore comment inside dynamic crypto import ([#17623](https://github.com/sveltejs/svelte/pull/17623))

- chore: wrap JSDoc URLs in `@see` and `@link` tags ([#17617](https://github.com/sveltejs/svelte/pull/17617))

- fix: properly hydrate already-resolved async blocks ([#17641](https://github.com/sveltejs/svelte/pull/17641))

- fix: emit `each_key_duplicate` error in production ([#16724](https://github.com/sveltejs/svelte/pull/16724))

- fix: exit resolved async blocks on correct node when hydrating ([#17640](https://github.com/sveltejs/svelte/pull/17640))

## 5.49.2

### Patch Changes

- chore: remove SvelteKit data attributes from elements.d.ts ([#17613](https://github.com/sveltejs/svelte/pull/17613))

- fix: avoid erroneous async derived expressions for blocks ([#17604](https://github.com/sveltejs/svelte/pull/17604))

- fix: avoid Cloudflare warnings about not having the "node:crypto" module ([#17612](https://github.com/sveltejs/svelte/pull/17612))

- fix: reschedule effects inside unskipped branches ([#17604](https://github.com/sveltejs/svelte/pull/17604))

## 5.49.1

### Patch Changes

- fix: merge consecutive large text nodes ([#17587](https://github.com/sveltejs/svelte/pull/17587))

- fix: only create async functions in SSR output when necessary ([#17593](https://github.com/sveltejs/svelte/pull/17593))

- fix: properly separate multiline html blocks from each other in `print()` ([#17319](https://github.com/sveltejs/svelte/pull/17319))

- fix: prevent unhandled exceptions arising from dangling promises in <script> ([#17591](https://github.com/sveltejs/svelte/pull/17591))

## 5.49.0

### Minor Changes

- feat: allow passing `ShadowRootInit` object to custom element `shadow` option ([#17088](https://github.com/sveltejs/svelte/pull/17088))

### Patch Changes

- fix: throw for unset `createContext` get on the server ([#17580](https://github.com/sveltejs/svelte/pull/17580))

- fix: reset effects inside skipped branches ([#17581](https://github.com/sveltejs/svelte/pull/17581))

- fix: preserve old dependencies when updating reaction inside fork ([#17579](https://github.com/sveltejs/svelte/pull/17579))

- fix: more conservative assignment_value_stale warnings ([#17574](https://github.com/sveltejs/svelte/pull/17574))

- fix: disregard `popover` elements when determining whether an element has content ([#17367](https://github.com/sveltejs/svelte/pull/17367))

- fix: fire introstart/outrostart events after delay, if specified ([#17567](https://github.com/sveltejs/svelte/pull/17567))

- fix: increment signal versions when discarding forks ([#17577](https://github.com/sveltejs/svelte/pull/17577))

## 5.48.5

### Patch Changes

- fix: run boundary `onerror` callbacks in a microtask, in case they result in the boundary's destruction ([#17561](https://github.com/sveltejs/svelte/pull/17561))

- fix: prevent unintended exports from namespaces ([#17562](https://github.com/sveltejs/svelte/pull/17562))

- fix: each block breaking with effects interspersed among items ([#17550](https://github.com/sveltejs/svelte/pull/17550))

## 5.48.4

### Patch Changes

- fix: avoid duplicating escaped characters in CSS AST ([#17554](https://github.com/sveltejs/svelte/pull/17554))

## 5.48.3

### Patch Changes

- fix: hydration failing with settled async blocks ([#17539](https://github.com/sveltejs/svelte/pull/17539))

- fix: add pointer and touch events to a11y_no_static_element_interactions warning ([#17551](https://github.com/sveltejs/svelte/pull/17551))

- fix: handle false dynamic components in SSR ([#17542](https://github.com/sveltejs/svelte/pull/17542))

- fix: avoid unnecessary block effect re-runs after async work completes ([#17535](https://github.com/sveltejs/svelte/pull/17535))

- fix: avoid using dev-mode array.includes wrapper on internal array checks ([#17536](https://github.com/sveltejs/svelte/pull/17536))

## 5.48.2

### Patch Changes

- fix: export `wait` function from internal client index ([#17530](https://github.com/sveltejs/svelte/pull/17530))

## 5.48.1

### Patch Changes

- fix: hoist snippets above const in same block ([#17516](https://github.com/sveltejs/svelte/pull/17516))

- fix: properly hydrate await in `{@html}` ([#17528](https://github.com/sveltejs/svelte/pull/17528))

- fix: batch resolution of async work ([#17511](https://github.com/sveltejs/svelte/pull/17511))

- fix: account for empty statements when visiting in transform async ([#17524](https://github.com/sveltejs/svelte/pull/17524))

- fix: avoid async overhead for already settled promises ([#17461](https://github.com/sveltejs/svelte/pull/17461))

- fix: better code generation for const tags with async dependencies ([#17518](https://github.com/sveltejs/svelte/pull/17518))

## 5.48.0

### Minor Changes

- feat: export `parseCss` from `svelte/compiler` ([#17496](https://github.com/sveltejs/svelte/pull/17496))

### Patch Changes

- fix: handle non-string values in `svelte:element` `this` attribute ([#17499](https://github.com/sveltejs/svelte/pull/17499))

- fix: faster deduplication of dependencies ([#17503](https://github.com/sveltejs/svelte/pull/17503))

## 5.47.1

### Patch Changes

- fix: trigger `selectedcontent` reactivity ([#17486](https://github.com/sveltejs/svelte/pull/17486))

## 5.47.0

### Minor Changes

- feat: customizable `<select>` elements ([#17429](https://github.com/sveltejs/svelte/pull/17429))

### Patch Changes

- fix: mark subtree of svelte boundary as dynamic ([#17468](https://github.com/sveltejs/svelte/pull/17468))

- fix: don't reset static elements with debug/snippets ([#17477](https://github.com/sveltejs/svelte/pull/17477))

## 5.46.4

### Patch Changes

- fix: use `devalue.uneval` to serialize `hydratable` keys ([`ef81048e238844b729942441541d6dcfe6c8ccca`](https://github.com/sveltejs/svelte/commit/ef81048e238844b729942441541d6dcfe6c8ccca))

## 5.46.3

### Patch Changes

- fix: reconnect clean deriveds when they are read in a reactive context ([#17362](https://github.com/sveltejs/svelte/pull/17362))

- fix: don't transform references of function declarations in legacy mode ([#17431](https://github.com/sveltejs/svelte/pull/17431))

- fix: notify deriveds of changes to sources inside forks ([#17437](https://github.com/sveltejs/svelte/pull/17437))

- fix: always reconnect deriveds in get, when appropriate ([#17451](https://github.com/sveltejs/svelte/pull/17451))

- fix: prevent derives without dependencies from ever re-running ([`286b40c4526ce9970cb81ddd5e65b93b722fe468`](https://github.com/sveltejs/svelte/commit/286b40c4526ce9970cb81ddd5e65b93b722fe468))

- fix: correctly update writable deriveds inside forks ([#17437](https://github.com/sveltejs/svelte/pull/17437))

- fix: remove `$inspect` calls after await expressions when compiling for production server code ([#17407](https://github.com/sveltejs/svelte/pull/17407))

- fix: clear batch between runs ([#17424](https://github.com/sveltejs/svelte/pull/17424))

- fix: adjust `loc` property of `Program` nodes created from `<script>` elements ([#17428](https://github.com/sveltejs/svelte/pull/17428))

- fix: don't revert source to UNINITIALIZED state when time travelling ([#17409](https://github.com/sveltejs/svelte/pull/17409))

## 5.46.2

### Notice

Not published due to CI issue

## 5.46.1

### Patch Changes

- fix: type `currentTarget` in `on` function ([#17370](https://github.com/sveltejs/svelte/pull/17370))

- fix: skip static optimisation for stateless deriveds after `await` ([#17389](https://github.com/sveltejs/svelte/pull/17389))

- fix: prevent infinite loop when HMRing a component with an `await` ([#17380](https://github.com/sveltejs/svelte/pull/17380))

## 5.46.0

### Minor Changes

- feat: Add `csp` option to `render(...)`, and emit hashes when using `hydratable` ([#17338](https://github.com/sveltejs/svelte/pull/17338))

## 5.45.10

### Patch Changes

- fix: race condition when importing `AsyncLocalStorage` ([#17350](https://github.com/sveltejs/svelte/pull/17350))

## 5.45.9

### Patch Changes

- fix: correctly reschedule deferred effects when reviving a batch after async work ([#17332](https://github.com/sveltejs/svelte/pull/17332))

- fix: correctly print `!doctype` during `print` ([#17341](https://github.com/sveltejs/svelte/pull/17341))

## 5.45.8

### Patch Changes

- fix: set AST `root.start` to `0` and `root.end` to `template.length` ([#17125](https://github.com/sveltejs/svelte/pull/17125))

- fix: prevent erroneous `state_referenced_locally` warnings on prop fallbacks ([#17329](https://github.com/sveltejs/svelte/pull/17329))

## 5.45.7

### Patch Changes

- fix: Add `<textarea wrap="off">` as a valid attribute value ([#17326](https://github.com/sveltejs/svelte/pull/17326))

- fix: add more css selectors to `print()` ([#17330](https://github.com/sveltejs/svelte/pull/17330))

- fix: don't crash on `hydratable` serialization failure ([#17315](https://github.com/sveltejs/svelte/pull/17315))

## 5.45.6

### Patch Changes

- fix: don't issue a11y warning for `<video>` without captions if it has no `src` ([#17311](https://github.com/sveltejs/svelte/pull/17311))

- fix: add `srcObject` to permitted `<audio>`/`<video>` attributes ([#17310](https://github.com/sveltejs/svelte/pull/17310))

## 5.45.5

### Patch Changes

- fix: correctly reconcile each blocks after outroing branches are resumed ([#17258](https://github.com/sveltejs/svelte/pull/17258))

- fix: destroy each items after siblings are resumed ([#17258](https://github.com/sveltejs/svelte/pull/17258))

## 5.45.4

### Patch Changes

- chore: move DOM-related effect properties to `effect.nodes` ([#17293](https://github.com/sveltejs/svelte/pull/17293))

- fix: allow `$props.id()` to occur after an `await` ([#17285](https://github.com/sveltejs/svelte/pull/17285))

- fix: keep reactions up to date even when read outside of effect ([#17295](https://github.com/sveltejs/svelte/pull/17295))

## 5.45.3

### Patch Changes

- add props to state_referenced_locally ([#17266](https://github.com/sveltejs/svelte/pull/17266))

- fix: preserve node locations for better sourcemaps ([#17269](https://github.com/sveltejs/svelte/pull/17269))

- fix: handle cross-realm Promises in `hydratable` ([#17284](https://github.com/sveltejs/svelte/pull/17284))

## 5.45.2

### Patch Changes

- fix: array destructuring after await ([#17254](https://github.com/sveltejs/svelte/pull/17254))

- fix: throw on invalid `{@tag}`s ([#17256](https://github.com/sveltejs/svelte/pull/17256))

## 5.45.1

### Patch Changes

- fix: link offscreen items and last effect in each block correctly ([#17240](https://github.com/sveltejs/svelte/pull/17240))

## 5.45.0

### Minor Changes

- feat: add `print(...)` function ([#16188](https://github.com/sveltejs/svelte/pull/16188))

## 5.44.1

### Patch Changes

- fix: await blockers before initialising const ([#17226](https://github.com/sveltejs/svelte/pull/17226))

- fix: link offscreen items and last effect in each block correctly ([#17244](https://github.com/sveltejs/svelte/pull/17244))

- fix: generate correct code for simple destructurings ([#17237](https://github.com/sveltejs/svelte/pull/17237))

- fix: ensure each block animations don't mess with transitions ([#17238](https://github.com/sveltejs/svelte/pull/17238))

## 5.44.0

### Minor Changes

- feat: `hydratable` API ([#17154](https://github.com/sveltejs/svelte/pull/17154))

## 5.43.15

### Patch Changes

- fix: don't execute attachments and attribute effects eagerly ([#17208](https://github.com/sveltejs/svelte/pull/17208))

- chore: lift "flushSync cannot be called in effects" restriction ([#17139](https://github.com/sveltejs/svelte/pull/17139))

- fix: store forked derived values ([#17212](https://github.com/sveltejs/svelte/pull/17212))

## 5.43.14

### Patch Changes

- fix: correctly migrate named self closing slots ([#17199](https://github.com/sveltejs/svelte/pull/17199))

- fix: error at compile time instead of at runtime on await expressions inside bindings/transitions/animations/attachments ([#17198](https://github.com/sveltejs/svelte/pull/17198))

- fix: take async blockers into account for bindings/transitions/animations/attachments ([#17198](https://github.com/sveltejs/svelte/pull/17198))

## 5.43.13

### Patch Changes

- fix: don't set derived values during time traveling ([#17200](https://github.com/sveltejs/svelte/pull/17200))

## 5.43.12

### Patch Changes

- fix: maintain correct linked list of effects when updating each blocks ([#17191](https://github.com/sveltejs/svelte/pull/17191))

## 5.43.11

### Patch Changes

- perf: don't use tracing overeager during dev ([#17183](https://github.com/sveltejs/svelte/pull/17183))

- fix: don't cancel transition of already outroing elements ([#17186](https://github.com/sveltejs/svelte/pull/17186))

## 5.43.10

### Patch Changes

- fix: avoid other batches running with queued root effects of main batch ([#17145](https://github.com/sveltejs/svelte/pull/17145))

## 5.43.9

### Patch Changes

- fix: correctly handle functions when determining async blockers ([#17137](https://github.com/sveltejs/svelte/pull/17137))

- fix: keep deriveds reactive after their original parent effect was destroyed ([#17171](https://github.com/sveltejs/svelte/pull/17171))

- fix: ensure eager effects don't break reactions chain ([#17138](https://github.com/sveltejs/svelte/pull/17138))

- fix: ensure async `@const` in boundary hydrates correctly ([#17165](https://github.com/sveltejs/svelte/pull/17165))

- fix: take blockers into account when creating `#await` blocks ([#17137](https://github.com/sveltejs/svelte/pull/17137))

- fix: parallelize async `@const`s in the template ([#17165](https://github.com/sveltejs/svelte/pull/17165))

## 5.43.8

### Patch Changes

- fix: each block losing reactivity when items removed while promise pending ([#17150](https://github.com/sveltejs/svelte/pull/17150))

## 5.43.7

### Patch Changes

- fix: properly defer document title until async work is complete ([#17158](https://github.com/sveltejs/svelte/pull/17158))

- fix: ensure deferred effects can be rescheduled later on ([#17147](https://github.com/sveltejs/svelte/pull/17147))

- fix: take blockers of components into account ([#17153](https://github.com/sveltejs/svelte/pull/17153))

## 5.43.6

### Patch Changes

- fix: don't deactivate other batches ([#17132](https://github.com/sveltejs/svelte/pull/17132))

## 5.43.5

### Patch Changes

- fix: ensure async static props/attributes are awaited ([#17120](https://github.com/sveltejs/svelte/pull/17120))

- fix: wait on dependencies of async bindings ([#17120](https://github.com/sveltejs/svelte/pull/17120))

- fix: await dependencies of style directives ([#17120](https://github.com/sveltejs/svelte/pull/17120))

## 5.43.4

### Patch Changes

- chore: simplify connection/disconnection logic ([#17105](https://github.com/sveltejs/svelte/pull/17105))

- fix: reconnect deriveds to effect tree when time-travelling ([#17105](https://github.com/sveltejs/svelte/pull/17105))

## 5.43.3

### Patch Changes

- fix: ensure fork always accesses correct values ([#17098](https://github.com/sveltejs/svelte/pull/17098))

- fix: change title only after any pending work has completed ([#17061](https://github.com/sveltejs/svelte/pull/17061))

- fix: preserve symbols when creating derived rest properties ([#17096](https://github.com/sveltejs/svelte/pull/17096))

## 5.43.2

### Patch Changes

- fix: treat each blocks with async dependencies as uncontrolled ([#17077](https://github.com/sveltejs/svelte/pull/17077))

## 5.43.1

### Patch Changes

- fix: transform `$bindable` after `await` expressions ([#17066](https://github.com/sveltejs/svelte/pull/17066))

## 5.43.0

### Minor Changes

- feat: out-of-order rendering ([#17038](https://github.com/sveltejs/svelte/pull/17038))

### Patch Changes

- fix: settle batch after DOM updates ([#17054](https://github.com/sveltejs/svelte/pull/17054))

## 5.42.3

### Patch Changes

- fix: handle `<svelte:head>` rendered asynchronously ([#17052](https://github.com/sveltejs/svelte/pull/17052))

- fix: don't restore batch in `#await` ([#17051](https://github.com/sveltejs/svelte/pull/17051))

## 5.42.2

### Patch Changes

- fix: better error message for global variable assignments ([#17036](https://github.com/sveltejs/svelte/pull/17036))

- chore: tweak memoizer logic ([#17042](https://github.com/sveltejs/svelte/pull/17042))

## 5.42.1

### Patch Changes

- fix: ignore fork `discard()` after `commit()` ([#17034](https://github.com/sveltejs/svelte/pull/17034))

## 5.42.0

### Minor Changes

- feat: experimental `fork` API ([#17004](https://github.com/sveltejs/svelte/pull/17004))

### Patch Changes

- fix: always allow `setContext` before first await in component ([#17031](https://github.com/sveltejs/svelte/pull/17031))

- fix: less confusing names for inspect errors ([#17026](https://github.com/sveltejs/svelte/pull/17026))

## 5.41.4

### Patch Changes

- fix: take into account static blocks when determining transition locality ([#17018](https://github.com/sveltejs/svelte/pull/17018))

- fix: coordinate mount of snippets with await expressions ([#17021](https://github.com/sveltejs/svelte/pull/17021))

- fix: better optimization of await expressions ([#17025](https://github.com/sveltejs/svelte/pull/17025))

- fix: flush pending changes after rendering `failed` snippet ([#16995](https://github.com/sveltejs/svelte/pull/16995))

## 5.41.3

### Patch Changes

- chore: exclude vite optimized deps from stack traces ([#17008](https://github.com/sveltejs/svelte/pull/17008))

- perf: skip repeatedly traversing the same derived ([#17016](https://github.com/sveltejs/svelte/pull/17016))

## 5.41.2

### Patch Changes

- fix: keep batches alive until all async work is complete ([#16971](https://github.com/sveltejs/svelte/pull/16971))

- fix: don't preserve reactivity context across function boundaries ([#17002](https://github.com/sveltejs/svelte/pull/17002))

- fix: make `$inspect` logs come from the callsite ([#17001](https://github.com/sveltejs/svelte/pull/17001))

- fix: ensure guards (eg. if, each, key) run before their contents ([#16930](https://github.com/sveltejs/svelte/pull/16930))

## 5.41.1

### Patch Changes

- fix: place `let:` declarations before `{@const}` declarations ([#16985](https://github.com/sveltejs/svelte/pull/16985))

- fix: improve `each_key_without_as` error ([#16983](https://github.com/sveltejs/svelte/pull/16983))

- chore: centralise branch management ([#16977](https://github.com/sveltejs/svelte/pull/16977))

## 5.41.0

### Minor Changes

- feat: add `$state.eager(value)` rune ([#16849](https://github.com/sveltejs/svelte/pull/16849))

### Patch Changes

- fix: preserve `<select>` state while focused ([#16958](https://github.com/sveltejs/svelte/pull/16958))

- chore: run boundary async effects in the context of the current batch ([#16968](https://github.com/sveltejs/svelte/pull/16968))

- fix: error if `each` block has `key` but no `as` clause ([#16966](https://github.com/sveltejs/svelte/pull/16966))

## 5.40.2

### Patch Changes

- fix: add hydration markers in `pending` branch of SSR boundary ([#16965](https://github.com/sveltejs/svelte/pull/16965))

## 5.40.1

### Patch Changes

- chore: Remove sync-in-async warning for server rendering ([#16949](https://github.com/sveltejs/svelte/pull/16949))

## 5.40.0

### Minor Changes

- feat: add `createContext` utility for type-safe context ([#16948](https://github.com/sveltejs/svelte/pull/16948))

### Patch Changes

- chore: simplify `batch.apply()` ([#16945](https://github.com/sveltejs/svelte/pull/16945))

- fix: don't rerun async effects unnecessarily ([#16944](https://github.com/sveltejs/svelte/pull/16944))

## 5.39.13

### Patch Changes

- fix: add missing type for `fr` attribute for `radialGradient` tags in svg ([#16943](https://github.com/sveltejs/svelte/pull/16943))

- fix: unset context on stale promises ([#16935](https://github.com/sveltejs/svelte/pull/16935))

## 5.39.12

### Patch Changes

- fix: better input cursor restoration for `bind:value` ([#16925](https://github.com/sveltejs/svelte/pull/16925))

- fix: track the user's getter of `bind:this` ([#16916](https://github.com/sveltejs/svelte/pull/16916))

- fix: generate correct SSR code for the case where `pending` is an attribute ([#16919](https://github.com/sveltejs/svelte/pull/16919))

- fix: generate correct code for `each` blocks with async body ([#16923](https://github.com/sveltejs/svelte/pull/16923))

## 5.39.11

### Patch Changes

- fix: flush batches whenever an async value resolves ([#16912](https://github.com/sveltejs/svelte/pull/16912))

## 5.39.10

### Patch Changes

- fix: hydrate each blocks inside element correctly ([#16908](https://github.com/sveltejs/svelte/pull/16908))

- fix: allow await in if block consequent and alternate ([#16890](https://github.com/sveltejs/svelte/pull/16890))

- fix: don't replace rest props with `$$props` for excluded props ([#16898](https://github.com/sveltejs/svelte/pull/16898))

- fix: correctly transform `$derived` private fields on server ([#16894](https://github.com/sveltejs/svelte/pull/16894))

- fix: add `UNKNOWN` evaluation value before breaking for `binding.initial===SnippetBlock` ([#16910](https://github.com/sveltejs/svelte/pull/16910))

## 5.39.9

### Patch Changes

- fix: flush when pending boundaries resolve ([#16897](https://github.com/sveltejs/svelte/pull/16897))

## 5.39.8

### Patch Changes

- fix: check boundary `pending` attribute at runtime on server ([#16855](https://github.com/sveltejs/svelte/pull/16855))

- fix: preserve tuple type in `$state.snapshot` ([#16864](https://github.com/sveltejs/svelte/pull/16864))

- fix: allow await in svelte:boundary without pending ([#16857](https://github.com/sveltejs/svelte/pull/16857))

- fix: update `bind:checked` error message to clarify usage with radio inputs ([#16874](https://github.com/sveltejs/svelte/pull/16874))

## 5.39.7

### Patch Changes

- chore: simplify batch logic ([#16847](https://github.com/sveltejs/svelte/pull/16847))

- fix: rebase pending batches when other batches are committed ([#16866](https://github.com/sveltejs/svelte/pull/16866))

- fix: wrap async `children` in `$$renderer.async` ([#16862](https://github.com/sveltejs/svelte/pull/16862))

- fix: silence label warning for buttons and anchor tags with title attributes ([#16872](https://github.com/sveltejs/svelte/pull/16872))

- fix: coerce nullish `<title>` to empty string ([#16863](https://github.com/sveltejs/svelte/pull/16863))

## 5.39.6

### Patch Changes

- fix: depend on reads of deriveds created within reaction (async mode) ([#16823](https://github.com/sveltejs/svelte/pull/16823))

- fix: SSR regression of processing attributes of `<select>` and `<option>` ([#16821](https://github.com/sveltejs/svelte/pull/16821))

- fix: async `class:` + spread attributes were compiled into sync server-side code ([#16834](https://github.com/sveltejs/svelte/pull/16834))

- fix: ensure tick resolves within a macrotask ([#16825](https://github.com/sveltejs/svelte/pull/16825))

## 5.39.5

### Patch Changes

- fix: allow `{@html await ...}` and snippets with async content on the server ([#16817](https://github.com/sveltejs/svelte/pull/16817))

- fix: use nginx SSI-compatible comments for `$props.id()` ([#16820](https://github.com/sveltejs/svelte/pull/16820))

## 5.39.4

### Patch Changes

- fix: restore hydration state after `await` in `<script>` ([#16806](https://github.com/sveltejs/svelte/pull/16806))

## 5.39.3

### Patch Changes

- fix: remove outer hydration markers ([#16800](https://github.com/sveltejs/svelte/pull/16800))

- fix: async hydration ([#16797](https://github.com/sveltejs/svelte/pull/16797))

## 5.39.2

### Patch Changes

- fix: preserve SSR context when block expressions contain `await` ([#16791](https://github.com/sveltejs/svelte/pull/16791))

- chore: bump some devDependencies ([#16787](https://github.com/sveltejs/svelte/pull/16787))

## 5.39.1

### Patch Changes

- fix: issue `state_proxy_unmount` warning when unmounting a state proxy ([#16747](https://github.com/sveltejs/svelte/pull/16747))

- fix: add `then` to class component `render` output ([#16783](https://github.com/sveltejs/svelte/pull/16783))

## 5.39.0

### Minor Changes

- feat: experimental async SSR ([#16748](https://github.com/sveltejs/svelte/pull/16748))

### Patch Changes

- fix: correctly SSR hidden="until-found" ([#16773](https://github.com/sveltejs/svelte/pull/16773))

## 5.38.10

### Patch Changes

- fix: flush effects scheduled during boundary's pending phase ([#16738](https://github.com/sveltejs/svelte/pull/16738))

## 5.38.9

### Patch Changes

- chore: generate CSS hash using the filename ([#16740](https://github.com/sveltejs/svelte/pull/16740))

- fix: correctly analyze `<object.property>` components ([#16711](https://github.com/sveltejs/svelte/pull/16711))

- fix: clean up scheduling system ([#16741](https://github.com/sveltejs/svelte/pull/16741))

- fix: transform input defaults from spread ([#16481](https://github.com/sveltejs/svelte/pull/16481))

- fix: don't destroy contents of `svelte:boundary` unless the boundary is an error boundary ([#16746](https://github.com/sveltejs/svelte/pull/16746))

## 5.38.8

### Patch Changes

- fix: send `$effect.pending` count to the correct boundary ([#16732](https://github.com/sveltejs/svelte/pull/16732))

## 5.38.7

### Patch Changes

- fix: replace `undefined` with `void(0)` in CallExpressions ([#16693](https://github.com/sveltejs/svelte/pull/16693))

- fix: ensure batch exists when resetting a failed boundary ([#16698](https://github.com/sveltejs/svelte/pull/16698))

- fix: place store setup inside async body ([#16687](https://github.com/sveltejs/svelte/pull/16687))

## 5.38.6

### Patch Changes

- fix: don't fail on `flushSync` while flushing effects ([#16674](https://github.com/sveltejs/svelte/pull/16674))

## 5.38.5

### Patch Changes

- fix: ensure async deriveds always get dependencies from thennable ([#16672](https://github.com/sveltejs/svelte/pull/16672))

## 5.38.4

### Patch Changes

- fix: place instance-level snippets inside async body ([#16666](https://github.com/sveltejs/svelte/pull/16666))

- fix: Add check for builtin custom elements in `set_custom_element_data` ([#16592](https://github.com/sveltejs/svelte/pull/16592))

- fix: restore batch along with effect context ([#16668](https://github.com/sveltejs/svelte/pull/16668))

- fix: wait until changes propagate before updating input selection state ([#16649](https://github.com/sveltejs/svelte/pull/16649))

- fix: add "Accept-CH" as valid value for `http-equiv` ([#16671](https://github.com/sveltejs/svelte/pull/16671))

## 5.38.3

### Patch Changes

- fix: ensure correct order of template effect values ([#16655](https://github.com/sveltejs/svelte/pull/16655))

- fix: allow async `{@const}` in more places ([#16643](https://github.com/sveltejs/svelte/pull/16643))

- fix: properly catch top level await errors ([#16619](https://github.com/sveltejs/svelte/pull/16619))

- perf: prune effects without dependencies ([#16625](https://github.com/sveltejs/svelte/pull/16625))

- fix: only emit `for_await_track_reactivity_loss` in async mode ([#16644](https://github.com/sveltejs/svelte/pull/16644))

## 5.38.2

### Patch Changes

- perf: run blocks eagerly during flush instead of aborting ([#16631](https://github.com/sveltejs/svelte/pull/16631))

- fix: don't clone non-proxies in `$inspect` ([#16617](https://github.com/sveltejs/svelte/pull/16617))

- fix: avoid recursion error when tagging circular references ([#16622](https://github.com/sveltejs/svelte/pull/16622))

## 5.38.1

### Patch Changes

- fix: wrap `abort` in `without_reactive_context` ([#16570](https://github.com/sveltejs/svelte/pull/16570))

- fix: add `hint` as a possible value for `popover` attribute ([#16581](https://github.com/sveltejs/svelte/pull/16581))

- fix: skip effects inside dynamic component that is about to be destroyed ([#16601](https://github.com/sveltejs/svelte/pull/16601))

## 5.38.0

### Minor Changes

- feat: allow `await` inside `@const` declarations ([#16542](https://github.com/sveltejs/svelte/pull/16542))

### Patch Changes

- fix: remount at any hydration error ([#16248](https://github.com/sveltejs/svelte/pull/16248))

- chore: emit `await_reactivity_loss` in `for await` loops ([#16521](https://github.com/sveltejs/svelte/pull/16521))

- fix: emit `snippet_invalid_export` instead of `undefined_export` for exported snippets ([#16539](https://github.com/sveltejs/svelte/pull/16539))

## 5.37.3

### Patch Changes

- fix: reset attribute cache after setting corresponding property ([#16543](https://github.com/sveltejs/svelte/pull/16543))

## 5.37.2

### Patch Changes

- fix: double event processing in firefox due to event object being garbage collected ([#16527](https://github.com/sveltejs/svelte/pull/16527))

- fix: add bindable dimension attributes types to SVG and MathML elements ([#16525](https://github.com/sveltejs/svelte/pull/16525))

- fix: correctly differentiate static fields before emitting `duplicate_class_field` ([#16526](https://github.com/sveltejs/svelte/pull/16526))

- fix: prevent last_propagated_event from being DCE'd ([#16538](https://github.com/sveltejs/svelte/pull/16538))

## 5.37.1

### Patch Changes

- chore: remove some todos ([#16515](https://github.com/sveltejs/svelte/pull/16515))

- fix: allow await expressions inside `{#await ...}` argument ([#16514](https://github.com/sveltejs/svelte/pull/16514))

- fix: `append_styles` in an effect to make them available on mount ([#16509](https://github.com/sveltejs/svelte/pull/16509))

- chore: remove `parser.template_untrimmed` ([#16511](https://github.com/sveltejs/svelte/pull/16511))

- fix: always inject styles when compiling as a custom element ([#16509](https://github.com/sveltejs/svelte/pull/16509))

## 5.37.0

### Minor Changes

- feat: ignore component options in `compileModule` ([#16362](https://github.com/sveltejs/svelte/pull/16362))

### Patch Changes

- fix: always mark props as stateful ([#16504](https://github.com/sveltejs/svelte/pull/16504))

## 5.36.17

### Patch Changes

- fix: throw on duplicate class field declarations ([#16502](https://github.com/sveltejs/svelte/pull/16502))

- fix: add types for `part` attribute to svg attributes ([#16499](https://github.com/sveltejs/svelte/pull/16499))

## 5.36.16

### Patch Changes

- fix: don't update a focused input with values from its own past ([#16491](https://github.com/sveltejs/svelte/pull/16491))

- fix: don't destroy effect roots created inside of deriveds ([#16492](https://github.com/sveltejs/svelte/pull/16492))

## 5.36.15

### Patch Changes

- fix: preserve dirty status of deferred effects ([#16487](https://github.com/sveltejs/svelte/pull/16487))

## 5.36.14

### Patch Changes

- fix: keep input in sync when binding updated via effect ([#16482](https://github.com/sveltejs/svelte/pull/16482))

- fix: rename form accept-charset attribute ([#16478](https://github.com/sveltejs/svelte/pull/16478))

- fix: prevent infinite async loop ([#16482](https://github.com/sveltejs/svelte/pull/16482))

- fix: exclude derived writes from effect abort and rescheduling ([#16482](https://github.com/sveltejs/svelte/pull/16482))

## 5.36.13

### Patch Changes

- fix: ensure subscriptions are picked up correctly by deriveds ([#16466](https://github.com/sveltejs/svelte/pull/16466))

## 5.36.12

### Patch Changes

- chore: move `capture_signals` to legacy module ([#16456](https://github.com/sveltejs/svelte/pull/16456))

## 5.36.11

### Patch Changes

- fix: always mark reactions of deriveds ([#16457](https://github.com/sveltejs/svelte/pull/16457))

- fix: add labels to `@const` tags and props ([#16454](https://github.com/sveltejs/svelte/pull/16454))

- fix: tag stores for `$inspect.trace()` ([#16452](https://github.com/sveltejs/svelte/pull/16452))

## 5.36.10

### Patch Changes

- fix: prevent batches from getting intertwined ([#16446](https://github.com/sveltejs/svelte/pull/16446))

## 5.36.9

### Patch Changes

- fix: don't reexecute derived with no dependencies on teardown ([#16438](https://github.com/sveltejs/svelte/pull/16438))

- fix: disallow `export { foo as default }` in `<script module>` ([#16447](https://github.com/sveltejs/svelte/pull/16447))

- fix: move ownership validation into async component body ([#16449](https://github.com/sveltejs/svelte/pull/16449))

- fix: allow async destructured deriveds ([#16444](https://github.com/sveltejs/svelte/pull/16444))

- fix: move store setup/cleanup outside of async component body ([#16443](https://github.com/sveltejs/svelte/pull/16443))

## 5.36.8

### Patch Changes

- fix: keep effect in the graph if it has an abort controller ([#16430](https://github.com/sveltejs/svelte/pull/16430))

- chore: Switch `payload.out` to an array ([#16428](https://github.com/sveltejs/svelte/pull/16428))

## 5.36.7

### Patch Changes

- fix: allow instrinsic `<svelte:...>` elements to inherit from `SvelteHTMLElements` ([#16424](https://github.com/sveltejs/svelte/pull/16424))

## 5.36.6

### Patch Changes

- fix: delegate functions with shadowed variables if declared locally ([#16417](https://github.com/sveltejs/svelte/pull/16417))

- fix: handle error in correct boundary after reset ([#16171](https://github.com/sveltejs/svelte/pull/16171))

- fix: make `<svelte:boundary>` reset function a noop after the first call ([#16171](https://github.com/sveltejs/svelte/pull/16171))

## 5.36.5

### Patch Changes

- fix: silence `$inspect` errors when the effect is about to be destroyed ([#16391](https://github.com/sveltejs/svelte/pull/16391))

- fix: more informative error when effects run in an infinite loop ([#16405](https://github.com/sveltejs/svelte/pull/16405))

## 5.36.4

### Patch Changes

- fix: avoid microtask in flushSync ([#16394](https://github.com/sveltejs/svelte/pull/16394))

- fix: ensure compiler state is reset before compilation ([#16396](https://github.com/sveltejs/svelte/pull/16396))

## 5.36.3

### Patch Changes

- fix: don't log `await_reactivity_loss` warning when signal is read in `untrack` ([#16385](https://github.com/sveltejs/svelte/pull/16385))

- fix: better handle $inspect on array mutations ([#16389](https://github.com/sveltejs/svelte/pull/16389))

- fix: leave proxied array `length` untouched when deleting properties ([#16389](https://github.com/sveltejs/svelte/pull/16389))

- fix: update `$effect.pending()` immediately after a batch is removed ([#16382](https://github.com/sveltejs/svelte/pull/16382))

## 5.36.2

### Patch Changes

- fix: add `$effect.pending()` to types ([#16376](https://github.com/sveltejs/svelte/pull/16376))

- fix: add `pending` snippet to `<svelte:boundary>` types ([#16379](https://github.com/sveltejs/svelte/pull/16379))

## 5.36.1

### Patch Changes

- fix: only skip updating bound `<input>` if the input was the source of the change ([#16373](https://github.com/sveltejs/svelte/pull/16373))

## 5.36.0

### Minor Changes

- feat: support `await` in components when using the `experimental.async` compiler option ([#15844](https://github.com/sveltejs/svelte/pull/15844))

### Patch Changes

- fix: silence a11y warning for inert elements ([#16339](https://github.com/sveltejs/svelte/pull/16339))

- chore: clean up a11y analysis code ([#16345](https://github.com/sveltejs/svelte/pull/16345))

## 5.35.7

### Patch Changes

- fix: silence autofocus a11y warning inside `<dialog>` ([#16341](https://github.com/sveltejs/svelte/pull/16341))

- fix: don't show adjusted error messages in boundaries ([#16360](https://github.com/sveltejs/svelte/pull/16360))

- chore: replace inline regex with variable ([#16340](https://github.com/sveltejs/svelte/pull/16340))

## 5.35.6

### Patch Changes

- chore: simplify reaction/source ownership tracking ([#16333](https://github.com/sveltejs/svelte/pull/16333))

- chore: simplify internal component `pop()` ([#16331](https://github.com/sveltejs/svelte/pull/16331))

## 5.35.5

### Patch Changes

- fix: associate sources in Spring/Tween/SvelteMap/SvelteSet with correct reaction ([#16325](https://github.com/sveltejs/svelte/pull/16325))

- fix: re-evaluate derived props during teardown ([#16278](https://github.com/sveltejs/svelte/pull/16278))

## 5.35.4

### Patch Changes

- fix: abort and reschedule effect processing after state change in user effect ([#16280](https://github.com/sveltejs/svelte/pull/16280))

## 5.35.3

### Patch Changes

- fix: account for mounting when `select_option` in `attribute_effect` ([#16309](https://github.com/sveltejs/svelte/pull/16309))

- fix: do not proxify the value assigned to a derived ([#16302](https://github.com/sveltejs/svelte/pull/16302))

## 5.35.2

### Patch Changes

- fix: bump esrap ([#16295](https://github.com/sveltejs/svelte/pull/16295))

## 5.35.1

### Patch Changes

- feat: add parent hierarchy to `__svelte_meta` objects ([#16255](https://github.com/sveltejs/svelte/pull/16255))

## 5.35.0

### Minor Changes

- feat: add `getAbortSignal()` ([#16266](https://github.com/sveltejs/svelte/pull/16266))

### Patch Changes

- chore: simplify props ([#16270](https://github.com/sveltejs/svelte/pull/16270))

## 5.34.9

### Patch Changes

- fix: ensure unowned deriveds can add themselves as reactions while connected ([#16249](https://github.com/sveltejs/svelte/pull/16249))

## 5.34.8

### Patch Changes

- fix: untrack `$inspect.with` and add check for unsafe mutation ([#16209](https://github.com/sveltejs/svelte/pull/16209))

- fix: use fine grained for template if the component is not explicitly in legacy mode ([#16232](https://github.com/sveltejs/svelte/pull/16232))

- lift unsafe_state_mutation constraints for SvelteSet, SvelteMap, SvelteDate, SvelteURL and SvelteURLSearchParams created inside the derived ([#16221](https://github.com/sveltejs/svelte/pull/16221))

## 5.34.7

### Patch Changes

- fix: address css class matching regression ([#16204](https://github.com/sveltejs/svelte/pull/16204))

## 5.34.6

### Patch Changes

- fix: match class and style directives against attribute selector ([#16179](https://github.com/sveltejs/svelte/pull/16179))

## 5.34.5

### Patch Changes

- fix: keep spread non-delegated event handlers up to date ([#16180](https://github.com/sveltejs/svelte/pull/16180))

- fix: remove undefined attributes on hydration ([#16178](https://github.com/sveltejs/svelte/pull/16178))

- fix: ensure sources within nested effects still register correctly ([#16193](https://github.com/sveltejs/svelte/pull/16193))

- fix: avoid shadowing a variable in dynamic components ([#16185](https://github.com/sveltejs/svelte/pull/16185))

## 5.34.4

### Patch Changes

- fix: don't set state withing `with_parent` in proxy ([#16176](https://github.com/sveltejs/svelte/pull/16176))

- fix: use compiler-driven reactivity in legacy mode template expressions ([#16100](https://github.com/sveltejs/svelte/pull/16100))

## 5.34.3

### Patch Changes

- fix: don't eagerly execute deriveds on resume ([#16150](https://github.com/sveltejs/svelte/pull/16150))

- fix: prevent memory leaking signals in legacy mode ([#16145](https://github.com/sveltejs/svelte/pull/16145))

- fix: don't define `error.message` if it's not configurable ([#16149](https://github.com/sveltejs/svelte/pull/16149))

## 5.34.2

### Patch Changes

- fix: add missing typings for some dimension bindings ([#16142](https://github.com/sveltejs/svelte/pull/16142))

- fix: prune typescript class field declarations ([#16154](https://github.com/sveltejs/svelte/pull/16154))

## 5.34.1

### Patch Changes

- fix: correctly tag private class state fields ([#16132](https://github.com/sveltejs/svelte/pull/16132))

## 5.34.0

### Minor Changes

- feat: add source name logging to `$inspect.trace` ([#16060](https://github.com/sveltejs/svelte/pull/16060))

### Patch Changes

- fix: add `command` and `commandfor` to `HTMLButtonAttributes` ([#16117](https://github.com/sveltejs/svelte/pull/16117))

- fix: better `$inspect.trace()` output ([#16131](https://github.com/sveltejs/svelte/pull/16131))

- fix: properly hydrate dynamic css props components and remove element removal ([#16118](https://github.com/sveltejs/svelte/pull/16118))

## 5.33.19

### Patch Changes

- fix: reset `is_flushing` if `flushSync` is called and there's no scheduled effect ([#16119](https://github.com/sveltejs/svelte/pull/16119))

## 5.33.18

### Patch Changes

- chore: bump `esrap` dependency ([#16106](https://github.com/sveltejs/svelte/pull/16106))

- fix: destructuring state in ssr ([#16102](https://github.com/sveltejs/svelte/pull/16102))

## 5.33.17

### Patch Changes

- chore: update acorn parser `ecmaVersion` to parse import attributes ([#16098](https://github.com/sveltejs/svelte/pull/16098))

## 5.33.16

### Patch Changes

- fix: visit expression when destructuring state declarations ([#16081](https://github.com/sveltejs/svelte/pull/16081))

- fix: move xmlns attribute from SVGAttributes to to DOMAttributes ([#16080](https://github.com/sveltejs/svelte/pull/16080))

## 5.33.15

### Patch Changes

- fix: invoke parent boundary of deriveds that throw ([#16091](https://github.com/sveltejs/svelte/pull/16091))

## 5.33.14

### Patch Changes

- Revert "feat: enable TS autocomplete for Svelte HTML element definitions" ([#16063](https://github.com/sveltejs/svelte/pull/16063))

- fix: destructuring snippet arguments ([#16068](https://github.com/sveltejs/svelte/pull/16068))

## 5.33.13

### Patch Changes

- fix: avoid recursion error in `EachBlock` visitor ([#16058](https://github.com/sveltejs/svelte/pull/16058))

## 5.33.12

### Patch Changes

- fix: correctly transform reassignments to class fields in SSR mode ([#16051](https://github.com/sveltejs/svelte/pull/16051))

## 5.33.11

### Patch Changes

- fix: treat transitive dependencies of each blocks as mutable in legacy mode if item is mutated ([#16038](https://github.com/sveltejs/svelte/pull/16038))

## 5.33.10

### Patch Changes

- fix: use `fill: 'forwards'` on transition animations to prevent flicker ([#16035](https://github.com/sveltejs/svelte/pull/16035))

## 5.33.9

### Patch Changes

- fix: put expressions in effects unless known to be static ([#15792](https://github.com/sveltejs/svelte/pull/15792))

## 5.33.8

### Patch Changes

- fix: only `select_option` if `'value'` is in `next` ([#16032](https://github.com/sveltejs/svelte/pull/16032))

## 5.33.7

### Patch Changes

- fix: `bind:value` to select with stores ([#16028](https://github.com/sveltejs/svelte/pull/16028))

## 5.33.6

### Patch Changes

- fix: falsy attachments on components ([#16021](https://github.com/sveltejs/svelte/pull/16021))

- fix: correctly mark <option> elements as selected during SSR ([#16017](https://github.com/sveltejs/svelte/pull/16017))

## 5.33.5

### Patch Changes

- fix: handle derived destructured iterators ([#16015](https://github.com/sveltejs/svelte/pull/16015))

- fix: avoid rerunning attachments when unrelated spread attributes change ([#15961](https://github.com/sveltejs/svelte/pull/15961))

## 5.33.4

### Patch Changes

- fix: narrow `defaultChecked` to boolean ([#16009](https://github.com/sveltejs/svelte/pull/16009))

- fix: warn when using rest or identifier in custom elements without props option ([#16003](https://github.com/sveltejs/svelte/pull/16003))

## 5.33.3

### Patch Changes

- fix: allow using typescript in `customElement.extend` option ([#16001](https://github.com/sveltejs/svelte/pull/16001))

- fix: cleanup event handlers on media elements ([#16005](https://github.com/sveltejs/svelte/pull/16005))

## 5.33.2

### Patch Changes

- fix: correctly parse escaped unicode characters in css selector ([#15976](https://github.com/sveltejs/svelte/pull/15976))

- fix: don't mark deriveds as clean if updating during teardown ([#15997](https://github.com/sveltejs/svelte/pull/15997))

## 5.33.1

### Patch Changes

- fix: make deriveds on the server lazy again ([#15964](https://github.com/sveltejs/svelte/pull/15964))

## 5.33.0

### Minor Changes

- feat: XHTML compliance ([#15538](https://github.com/sveltejs/svelte/pull/15538))

- feat: add `fragments: 'html' | 'tree'` option for wider CSP compliance ([#15538](https://github.com/sveltejs/svelte/pull/15538))

## 5.32.2

### Patch Changes

- chore: simplify `<pre>` cleaning ([#15980](https://github.com/sveltejs/svelte/pull/15980))

- fix: attach `__svelte_meta` correctly to elements following a CSS wrapper ([#15982](https://github.com/sveltejs/svelte/pull/15982))

- fix: import untrack directly from client in `svelte/attachments` ([#15974](https://github.com/sveltejs/svelte/pull/15974))

## 5.32.1

### Patch Changes

- Warn when an invalid `<select multiple>` value is given ([#14816](https://github.com/sveltejs/svelte/pull/14816))

## 5.32.0

### Minor Changes

- feat: warn on implicitly closed tags ([#15932](https://github.com/sveltejs/svelte/pull/15932))

- feat: attachments `fromAction` utility ([#15933](https://github.com/sveltejs/svelte/pull/15933))

### Patch Changes

- fix: only re-run directly applied attachment if it changed ([#15962](https://github.com/sveltejs/svelte/pull/15962))

## 5.31.1

### Patch Changes

- fix: avoid auto-parenthesis for special-keywords-only `MediaQuery` ([#15937](https://github.com/sveltejs/svelte/pull/15937))

## 5.31.0

### Minor Changes

- feat: allow state fields to be declared inside class constructors ([#15820](https://github.com/sveltejs/svelte/pull/15820))

### Patch Changes

- fix: Add missing `AttachTag` in `Tag` union type inside the `AST` namespace from `"svelte/compiler"` ([#15946](https://github.com/sveltejs/svelte/pull/15946))

## 5.30.2

### Patch Changes

- fix: falsy attachments types ([#15939](https://github.com/sveltejs/svelte/pull/15939))

- fix: handle more hydration mismatches ([#15851](https://github.com/sveltejs/svelte/pull/15851))

## 5.30.1

### Patch Changes

- fix: add `typeParams` to `SnippetBlock` for legacy parser ([#15921](https://github.com/sveltejs/svelte/pull/15921))

## 5.30.0

### Minor Changes

- feat: allow generics on snippets ([#15915](https://github.com/sveltejs/svelte/pull/15915))

## 5.29.0

### Minor Changes

- feat: attachments ([#15000](https://github.com/sveltejs/svelte/pull/15000))

## 5.28.7

### Patch Changes

- fix: remove unncessary guards that require CSP privilege when removing event attributes ([#15846](https://github.com/sveltejs/svelte/pull/15846))

- fix: rewrite destructuring logic to handle iterators ([#15813](https://github.com/sveltejs/svelte/pull/15813))

## 5.28.6

### Patch Changes

- fix: use `transform.read` for `ownership_validator.mutation` array ([#15848](https://github.com/sveltejs/svelte/pull/15848))

- fix: don't redeclare `$slots` ([#15849](https://github.com/sveltejs/svelte/pull/15849))

## 5.28.5

### Patch Changes

- fix: proxify the value in assignment shorthands to the private field ([#15862](https://github.com/sveltejs/svelte/pull/15862))

- fix: more frequently update `bind:buffered` to actual value ([#15874](https://github.com/sveltejs/svelte/pull/15874))

## 5.28.4

### Patch Changes

- fix: treat nullish expression as empty string ([#15901](https://github.com/sveltejs/svelte/pull/15901))

- fix: prevent invalid BigInt calls from blowing up at compile time ([#15900](https://github.com/sveltejs/svelte/pull/15900))

- fix: warn on bidirectional control characters ([#15893](https://github.com/sveltejs/svelte/pull/15893))

- fix: emit right error for a shadowed invalid rune ([#15892](https://github.com/sveltejs/svelte/pull/15892))

## 5.28.3

### Patch Changes

- chore: avoid microtasks when flushing sync ([#15895](https://github.com/sveltejs/svelte/pull/15895))

- fix: improve error message for migration errors when slot would be renamed ([#15841](https://github.com/sveltejs/svelte/pull/15841))

- fix: allow characters in the supplementary special-purpose plane ([#15823](https://github.com/sveltejs/svelte/pull/15823))

## 5.28.2

### Patch Changes

- fix: don't mark selector lists inside `:global` with multiple items as unused ([#15817](https://github.com/sveltejs/svelte/pull/15817))

## 5.28.1

### Patch Changes

- fix: ensure `<svelte:boundary>` properly removes error content in production mode ([#15793](https://github.com/sveltejs/svelte/pull/15793))

- fix: `update_version` after `delete` if `source` is `undefined` and `prop` in `target` ([#15796](https://github.com/sveltejs/svelte/pull/15796))

- fix: emit error on wrong placement of the `:global` block selector ([#15794](https://github.com/sveltejs/svelte/pull/15794))

## 5.28.0

### Minor Changes

- feat: partially evaluate more expressions ([#15781](https://github.com/sveltejs/svelte/pull/15781))

## 5.27.3

### Patch Changes

- fix: use function declaration for snippets in server output to avoid TDZ violation ([#15789](https://github.com/sveltejs/svelte/pull/15789))

## 5.27.2

### Patch Changes

- chore: use pkg.imports for common modules ([#15787](https://github.com/sveltejs/svelte/pull/15787))

## 5.27.1

### Patch Changes

- chore: default params for html blocks ([#15778](https://github.com/sveltejs/svelte/pull/15778))

- fix: correct suggested type for custom events without detail ([#15763](https://github.com/sveltejs/svelte/pull/15763))

- fix: Throw on unrendered snippets in `dev` ([#15766](https://github.com/sveltejs/svelte/pull/15766))

- fix: avoid unnecessary read version increments ([#15777](https://github.com/sveltejs/svelte/pull/15777))

## 5.27.0

### Minor Changes

- feat: partially evaluate certain expressions ([#15494](https://github.com/sveltejs/svelte/pull/15494))

### Patch Changes

- fix: relax `:global` selector list validation ([#15762](https://github.com/sveltejs/svelte/pull/15762))

## 5.26.3

### Patch Changes

- fix: correctly validate head snippets on the server ([#15755](https://github.com/sveltejs/svelte/pull/15755))

- fix: ignore mutation validation for props that are not proxies in more cases ([#15759](https://github.com/sveltejs/svelte/pull/15759))

- fix: allow self-closing tags within math namespace ([#15761](https://github.com/sveltejs/svelte/pull/15761))

## 5.26.2

### Patch Changes

- fix: correctly validate `undefined` snippet params with default value ([#15750](https://github.com/sveltejs/svelte/pull/15750))

## 5.26.1

### Patch Changes

- fix: update `state_referenced_locally` message ([#15733](https://github.com/sveltejs/svelte/pull/15733))

## 5.26.0

### Minor Changes

- feat: add `css.hasGlobal` to `compile` output ([#15450](https://github.com/sveltejs/svelte/pull/15450))

### Patch Changes

- fix: add snippet argument validation in dev ([#15521](https://github.com/sveltejs/svelte/pull/15521))

## 5.25.12

### Patch Changes

- fix: improve internal_set versioning mechanic ([#15724](https://github.com/sveltejs/svelte/pull/15724))

- fix: don't transform reassigned state in labeled statement in `$derived` ([#15725](https://github.com/sveltejs/svelte/pull/15725))

## 5.25.11

### Patch Changes

- fix: handle hydration mismatches in await blocks ([#15708](https://github.com/sveltejs/svelte/pull/15708))

- fix: prevent ownership warnings if the fallback of a bindable is used ([#15720](https://github.com/sveltejs/svelte/pull/15720))

## 5.25.10

### Patch Changes

- fix: set deriveds as `CLEAN` if they are assigned to ([#15592](https://github.com/sveltejs/svelte/pull/15592))

- fix: better scope `:global()` with nesting selector `&` ([#15671](https://github.com/sveltejs/svelte/pull/15671))

## 5.25.9

### Patch Changes

- fix: allow `$.state` and `$.derived` to be treeshaken ([#15702](https://github.com/sveltejs/svelte/pull/15702))

- fix: rework binding ownership validation ([#15678](https://github.com/sveltejs/svelte/pull/15678))

## 5.25.8

### Patch Changes

- fix: address untracked_writes memory leak ([#15694](https://github.com/sveltejs/svelte/pull/15694))

## 5.25.7

### Patch Changes

- fix: ensure clearing of old values happens independent of root flushes ([#15664](https://github.com/sveltejs/svelte/pull/15664))

## 5.25.6

### Patch Changes

- fix: ignore generic type arguments while creating AST ([#15659](https://github.com/sveltejs/svelte/pull/15659))

- fix: better consider component and its snippets during css pruning ([#15630](https://github.com/sveltejs/svelte/pull/15630))

## 5.25.5

### Patch Changes

- fix: add setters to `$derived` class properties ([#15628](https://github.com/sveltejs/svelte/pull/15628))

- fix: silence assignment warning on more function bindings ([#15644](https://github.com/sveltejs/svelte/pull/15644))

- fix: make sure CSS is preserved during SSR with bindings ([#15645](https://github.com/sveltejs/svelte/pull/15645))

## 5.25.4

### Patch Changes

- fix: support TS type assertions ([#15642](https://github.com/sveltejs/svelte/pull/15642))

- fix: ensure `undefined` class still applies scoping class, if necessary ([#15643](https://github.com/sveltejs/svelte/pull/15643))

## 5.25.3

### Patch Changes

- fix: prevent state runes from being called with spread ([#15585](https://github.com/sveltejs/svelte/pull/15585))

## 5.25.2

### Patch Changes

- feat: migrate reassigned deriveds to `$derived` ([#15581](https://github.com/sveltejs/svelte/pull/15581))

## 5.25.1

### Patch Changes

- fix: prevent dev server from throwing errors when attempting to retrieve the proxied value of an iframe's contentWindow ([#15577](https://github.com/sveltejs/svelte/pull/15577))

## 5.25.0

### Minor Changes

- feat: make deriveds writable ([#15570](https://github.com/sveltejs/svelte/pull/15570))

## 5.24.1

### Patch Changes

- fix: use `get` in constructor for deriveds ([#15300](https://github.com/sveltejs/svelte/pull/15300))

- fix: ensure toStore root effect is connected to correct parent effect ([#15574](https://github.com/sveltejs/svelte/pull/15574))

## 5.24.0

### Minor Changes

- feat: allow state created in deriveds/effects to be written/read locally without self-invalidation ([#15553](https://github.com/sveltejs/svelte/pull/15553))

### Patch Changes

- fix: check if DOM prototypes are extensible ([#15569](https://github.com/sveltejs/svelte/pull/15569))

- Keep inlined trailing JSDoc comments of properties when running svelte-migrate ([#15567](https://github.com/sveltejs/svelte/pull/15567))

- fix: simplify set calls for proxyable values ([#15548](https://github.com/sveltejs/svelte/pull/15548))

- fix: don't depend on deriveds created inside the current reaction ([#15564](https://github.com/sveltejs/svelte/pull/15564))

## 5.23.2

### Patch Changes

- fix: don't hoist listeners that access non hoistable snippets ([#15534](https://github.com/sveltejs/svelte/pull/15534))

## 5.23.1

### Patch Changes

- fix: invalidate parent effects when child effects update parent dependencies ([#15506](https://github.com/sveltejs/svelte/pull/15506))

- fix: correctly match `:has()` selector during css pruning ([#15277](https://github.com/sveltejs/svelte/pull/15277))

- fix: replace `undefined` with `void 0` to avoid edge case ([#15511](https://github.com/sveltejs/svelte/pull/15511))

- fix: allow global-like pseudo-selectors refinement ([#15313](https://github.com/sveltejs/svelte/pull/15313))

- chore: don't distribute unused types definitions ([#15473](https://github.com/sveltejs/svelte/pull/15473))

- fix: add `files` and `group` to HTMLInputAttributes in elements.d.ts ([#15492](https://github.com/sveltejs/svelte/pull/15492))

- fix: throw rune_invalid_arguments_length when $state.raw() is used with more than 1 arg ([#15516](https://github.com/sveltejs/svelte/pull/15516))

## 5.23.0

### Minor Changes

- fix: make values consistent between effects and their cleanup functions ([#15469](https://github.com/sveltejs/svelte/pull/15469))

## 5.22.6

### Patch Changes

- fix: skip `log_if_contains_state` if only logging literals ([#15468](https://github.com/sveltejs/svelte/pull/15468))

- fix: Add `closedby` property to HTMLDialogAttributes type ([#15458](https://github.com/sveltejs/svelte/pull/15458))

- fix: null and warnings for local handlers ([#15460](https://github.com/sveltejs/svelte/pull/15460))

## 5.22.5

### Patch Changes

- fix: memoize `clsx` calls ([#15456](https://github.com/sveltejs/svelte/pull/15456))

- fix: respect `svelte-ignore hydration_attribute_changed` on elements with spread attributes ([#15443](https://github.com/sveltejs/svelte/pull/15443))

- fix: always use `setAttribute` when setting `style` ([#15323](https://github.com/sveltejs/svelte/pull/15323))

- fix: make `style:` directive and CSS handling more robust ([#15418](https://github.com/sveltejs/svelte/pull/15418))

## 5.22.4

### Patch Changes

- fix: never deduplicate expressions in templates ([#15451](https://github.com/sveltejs/svelte/pull/15451))

## 5.22.3

### Patch Changes

- fix: run effect roots in tree order ([#15446](https://github.com/sveltejs/svelte/pull/15446))

## 5.22.2

### Patch Changes

- fix: correctly set `is_updating` before flushing root effects ([#15442](https://github.com/sveltejs/svelte/pull/15442))

## 5.22.1

### Patch Changes

- chore: switch acorn-typescript plugin ([#15393](https://github.com/sveltejs/svelte/pull/15393))

## 5.22.0

### Minor Changes

- feat: Add `idPrefix` option to `render` ([#15428](https://github.com/sveltejs/svelte/pull/15428))

### Patch Changes

- fix: make dialog element and role interactive ([#15429](https://github.com/sveltejs/svelte/pull/15429))

## 5.21.0

### Minor Changes

- chore: Reduce hydration comment for {:else if} ([#15250](https://github.com/sveltejs/svelte/pull/15250))

### Patch Changes

- fix: disallow `bind:group` to snippet parameters ([#15401](https://github.com/sveltejs/svelte/pull/15401))

## 5.20.5

### Patch Changes

- fix: allow double hyphen css selector names ([#15384](https://github.com/sveltejs/svelte/pull/15384))

- fix: class:directive not working with $restProps #15386 ([#15389](https://github.com/sveltejs/svelte/pull/15389))
  fix: spread add an useless cssHash on non-scoped element

- fix: catch error on @const tag in svelte:boundary in DEV mode ([#15369](https://github.com/sveltejs/svelte/pull/15369))

- fix: allow for duplicate `var` declarations ([#15382](https://github.com/sveltejs/svelte/pull/15382))

- fix : bug "$0 is not defined" on svelte:element with a function call on class ([#15396](https://github.com/sveltejs/svelte/pull/15396))

## 5.20.4

### Patch Changes

- fix: update types and inline docs for flushSync ([#15348](https://github.com/sveltejs/svelte/pull/15348))

## 5.20.3

### Patch Changes

- fix: allow `@const` inside `#key` ([#15377](https://github.com/sveltejs/svelte/pull/15377))

- fix: remove unnecessary `?? ''` on some expressions ([#15287](https://github.com/sveltejs/svelte/pull/15287))

- fix: correctly override class attributes with class directives ([#15352](https://github.com/sveltejs/svelte/pull/15352))

## 5.20.2

### Patch Changes

- chore: remove unused `options.uid` in `render` ([#15302](https://github.com/sveltejs/svelte/pull/15302))

- fix: do not warn for `binding_property_non_reactive` if binding is a store in an each ([#15318](https://github.com/sveltejs/svelte/pull/15318))

- fix: prevent writable store value from becoming a proxy when reassigning using $-prefix ([#15283](https://github.com/sveltejs/svelte/pull/15283))

- fix: `muted` reactive without `bind` and select/autofocus attributes working with function calls ([#15326](https://github.com/sveltejs/svelte/pull/15326))

- fix: ensure input elements and elements with `dir` attribute are marked as non-static ([#15259](https://github.com/sveltejs/svelte/pull/15259))

- fix: fire delegated events on target even it was disabled in the meantime ([#15319](https://github.com/sveltejs/svelte/pull/15319))

## 5.20.1

### Patch Changes

- fix: ensure AST analysis on `svelte.js` modules succeeds ([#15297](https://github.com/sveltejs/svelte/pull/15297))

- fix: ignore typescript abstract methods ([#15267](https://github.com/sveltejs/svelte/pull/15267))

- fix: correctly ssr component in `svelte:head` with `$props.id()` or `css='injected'` ([#15291](https://github.com/sveltejs/svelte/pull/15291))

## 5.20.0

### Minor Changes

- feat: SSR-safe ID generation with `$props.id()` ([#15185](https://github.com/sveltejs/svelte/pull/15185))

### Patch Changes

- fix: take private and public into account for `constant_assignment` of derived state ([#15276](https://github.com/sveltejs/svelte/pull/15276))

- fix: value/checked not correctly set using spread ([#15239](https://github.com/sveltejs/svelte/pull/15239))

- chore: tweak effect self invalidation logic, run transition dispatches without reactive context ([#15275](https://github.com/sveltejs/svelte/pull/15275))

- fix: use `importNode` to clone templates for Firefox ([#15272](https://github.com/sveltejs/svelte/pull/15272))

- fix: recurse into `$derived` for ownership validation ([#15166](https://github.com/sveltejs/svelte/pull/15166))

## 5.19.10

### Patch Changes

- fix: when re-connecting unowned deriveds, remove their unowned flag ([#15255](https://github.com/sveltejs/svelte/pull/15255))

- fix: allow mutation of private derived state ([#15228](https://github.com/sveltejs/svelte/pull/15228))

## 5.19.9

### Patch Changes

- fix: ensure unowned derived dependencies are not duplicated when reactions are skipped ([#15232](https://github.com/sveltejs/svelte/pull/15232))

- fix: hydrate `href` that is part of spread attributes ([#15226](https://github.com/sveltejs/svelte/pull/15226))

## 5.19.8

### Patch Changes

- fix: properly set `value` property of custom elements ([#15206](https://github.com/sveltejs/svelte/pull/15206))

- fix: ensure custom element updates don't run in hydration mode ([#15217](https://github.com/sveltejs/svelte/pull/15217))

- fix: ensure tracking returns true, even if in unowned ([#15214](https://github.com/sveltejs/svelte/pull/15214))

## 5.19.7

### Patch Changes

- chore: remove unused code from signal logic ([#15195](https://github.com/sveltejs/svelte/pull/15195))

- fix: encounter svelte:element in blocks as sibling during pruning css ([#15165](https://github.com/sveltejs/svelte/pull/15165))

## 5.19.6

### Patch Changes

- fix: do not prune selectors like `:global(.foo):has(.scoped)` ([#15140](https://github.com/sveltejs/svelte/pull/15140))

- fix: don't error on slot prop inside block inside other component ([#15148](https://github.com/sveltejs/svelte/pull/15148))

- fix: ensure reactions are correctly attached for unowned deriveds ([#15158](https://github.com/sveltejs/svelte/pull/15158))

- fix: silence a11y attribute warnings when spread attributes present ([#15150](https://github.com/sveltejs/svelte/pull/15150))

- fix: prevent false-positive ownership validations due to hot reload ([#15154](https://github.com/sveltejs/svelte/pull/15154))

- fix: widen ownership when calling setContext ([#15153](https://github.com/sveltejs/svelte/pull/15153))

## 5.19.5

### Patch Changes

- fix: improve derived connection to ownership graph ([#15137](https://github.com/sveltejs/svelte/pull/15137))

- fix: correctly look for sibling elements inside blocks and components when pruning CSS ([#15106](https://github.com/sveltejs/svelte/pull/15106))

## 5.19.4

### Patch Changes

- fix: Add `bind:focused` property to `HTMLAttributes` type ([#15122](https://github.com/sveltejs/svelte/pull/15122))

- fix: lazily connect derievds (in deriveds) to their parent ([#15129](https://github.com/sveltejs/svelte/pull/15129))

- fix: disallow $state/$derived in const tags ([#15115](https://github.com/sveltejs/svelte/pull/15115))

## 5.19.3

### Patch Changes

- fix: don't throw for `undefined` non delegated event handlers ([#15087](https://github.com/sveltejs/svelte/pull/15087))

- fix: consistently set value to blank string when value attribute is undefined ([#15057](https://github.com/sveltejs/svelte/pull/15057))

- fix: optimise || expressions in template ([#15092](https://github.com/sveltejs/svelte/pull/15092))

- fix: correctly handle `novalidate` attribute casing ([#15083](https://github.com/sveltejs/svelte/pull/15083))

- fix: expand boolean attribute support ([#15095](https://github.com/sveltejs/svelte/pull/15095))

- fix: avoid double deriveds in component props ([#15089](https://github.com/sveltejs/svelte/pull/15089))

- fix: add check for `is` attribute to correctly detect custom elements ([#15086](https://github.com/sveltejs/svelte/pull/15086))

## 5.19.2

### Patch Changes

- fix: address regression with untrack ([#15079](https://github.com/sveltejs/svelte/pull/15079))

## 5.19.1

### Patch Changes

- fix: omit unnecessary nullish coallescing in template expressions ([#15056](https://github.com/sveltejs/svelte/pull/15056))

- fix: more efficient template effect grouping ([#15050](https://github.com/sveltejs/svelte/pull/15050))

- fix: ensure untrack correctly retains the active reaction ([#15065](https://github.com/sveltejs/svelte/pull/15065))

- fix: initialize `files` bind on hydration ([#15059](https://github.com/sveltejs/svelte/pull/15059))

## 5.19.0

### Minor Changes

- feat: Expose `ClassValue` from `svelte/elements` ([#15035](https://github.com/sveltejs/svelte/pull/15035))

### Patch Changes

- fix: create fewer deriveds for concatenated strings ([#15041](https://github.com/sveltejs/svelte/pull/15041))

- fix: correctly parse leading comments in function binding ([#15020](https://github.com/sveltejs/svelte/pull/15020))

## 5.18.0

### Minor Changes

- feat: allow `<template>` elements to contain any child ([#15007](https://github.com/sveltejs/svelte/pull/15007))

### Patch Changes

- fix: ensure resume effects are scheduled in topological order ([#15012](https://github.com/sveltejs/svelte/pull/15012))

- fix: bump esrap ([#15015](https://github.com/sveltejs/svelte/pull/15015))

- fix: remove listener on `bind_current_time` teardown ([#15013](https://github.com/sveltejs/svelte/pull/15013))

## 5.17.5

### Patch Changes

- feat: allow const tag inside `svelte:boundary` ([#14993](https://github.com/sveltejs/svelte/pull/14993))

- fix: ensure signal write invalidation within effects is consistent ([#14989](https://github.com/sveltejs/svelte/pull/14989))

## 5.17.4

### Patch Changes

- fix: never consider inert boundary effects ([#14999](https://github.com/sveltejs/svelte/pull/14999))

- fix: store access on component destroy ([#14968](https://github.com/sveltejs/svelte/pull/14968))

- fix: correctly transform `pre` with no content ([#14973](https://github.com/sveltejs/svelte/pull/14973))

- fix: wrap each block expression in derived to encapsulate effects ([#14967](https://github.com/sveltejs/svelte/pull/14967))

## 5.17.3

### Patch Changes

- fix: reset dependency read versions after reaction execution ([#14964](https://github.com/sveltejs/svelte/pull/14964))

## 5.17.2

### Patch Changes

- fix: account for parent scale when animating elements ([#14957](https://github.com/sveltejs/svelte/pull/14957))

- fix: apply `overflow: hidden` style when transitioning elements, where necessary ([#14930](https://github.com/sveltejs/svelte/pull/14930))

- fix: properly add owners to function bindings ([#14962](https://github.com/sveltejs/svelte/pull/14962))

## 5.17.1

### Patch Changes

- fix: remove bindable prop validation ([#14946](https://github.com/sveltejs/svelte/pull/14946))

- chore: tweak "invalid assignment" compiler error message ([#14955](https://github.com/sveltejs/svelte/pull/14955))

- fix: silence false-positive stale value warning ([#14958](https://github.com/sveltejs/svelte/pull/14958))

## 5.17.0

### Minor Changes

- feat: allow non-numeric values to be tweened by snapping immediately to new value ([#14941](https://github.com/sveltejs/svelte/pull/14941))

### Patch Changes

- fix: handle default values in object destructuring within "each" blocks when using characters like "}" and "]" ([#14554](https://github.com/sveltejs/svelte/pull/14554))

- fix: account for min-width/height in `slide` transition ([#14942](https://github.com/sveltejs/svelte/pull/14942))

- fix: prevent long delays causing erratic spring behaviour ([#14940](https://github.com/sveltejs/svelte/pull/14940))

- feat: warn on using `slide` transition with table elements ([#14936](https://github.com/sveltejs/svelte/pull/14936))

- chore: improve signal performance by reducing duplicate deps ([#14945](https://github.com/sveltejs/svelte/pull/14945))

## 5.16.6

### Patch Changes

- fix: Make Tween duration 0 set current to target immediately ([#14937](https://github.com/sveltejs/svelte/pull/14937))

- fix: guard against `customElements` being unavailable in browser extension contexts ([#14933](https://github.com/sveltejs/svelte/pull/14933))

- fix: treat `inert` as a boolean attribute ([#14935](https://github.com/sveltejs/svelte/pull/14935))

- fix: remove leading newline from `<pre>` contents ([#14922](https://github.com/sveltejs/svelte/pull/14922))

## 5.16.5

### Patch Changes

- fix: inherit correct namespace for `<title>` elements ([#14817](https://github.com/sveltejs/svelte/pull/14817))

- fix: don't throw `bind_invalid_export` if there's also a bindable prop with the same name ([#14813](https://github.com/sveltejs/svelte/pull/14813))

## 5.16.4

### Patch Changes

- fix: use cached indexOf array prototype method internally ([#14912](https://github.com/sveltejs/svelte/pull/14912))

- fix: make Tween work with continuous target changes ([#14895](https://github.com/sveltejs/svelte/pull/14895))

## 5.16.3

### Patch Changes

- fix: correctly parse `each` with loose parser ([#14887](https://github.com/sveltejs/svelte/pull/14887))

- fix: apply `clsx` logic to custom element `class` attributes ([#14907](https://github.com/sveltejs/svelte/pull/14907))

## 5.16.2

### Patch Changes

- fix: ensure disconnected deriveds correctly connect again ([#14899](https://github.com/sveltejs/svelte/pull/14899))

- fix: correctly highlight sources reassigned inside `trace` ([#14811](https://github.com/sveltejs/svelte/pull/14811))

## 5.16.1

### Patch Changes

- fix: ensure unowned deriveds correctly get re-linked to the graph ([#14855](https://github.com/sveltejs/svelte/pull/14855))

- fix: ensure $inspect.trace works correctly with null values ([#14853](https://github.com/sveltejs/svelte/pull/14853))

## 5.16.0

### Minor Changes

- feat: allow `class` attribute to be an object or array, using `clsx` ([#14714](https://github.com/sveltejs/svelte/pull/14714))

### Patch Changes

- fix: don't include keyframes in global scope in the keyframes to rename ([#14822](https://github.com/sveltejs/svelte/pull/14822))

## 5.15.0

### Minor Changes

- feat: add "worker" exports condition to better support bundling for worker-based environments ([#14779](https://github.com/sveltejs/svelte/pull/14779))

## 5.14.6

### Patch Changes

- fix: treeshake `$inspect.trace` code if unused in modules ([#14774](https://github.com/sveltejs/svelte/pull/14774))

- fix: Improve typescript DX for $inspect, $props, $bindable, and $host ([#14777](https://github.com/sveltejs/svelte/pull/14777))

## 5.14.5

### Patch Changes

- fix: bump esrap dependency ([#14765](https://github.com/sveltejs/svelte/pull/14765))

- fix: ensure svg namespace for `<a>` elements is correct ([#14756](https://github.com/sveltejs/svelte/pull/14756))

- fix: treeshake `$inspect.trace` code if unused ([#14770](https://github.com/sveltejs/svelte/pull/14770))

## 5.14.4

### Patch Changes

- fix: remove implements from class declarations ([#14749](https://github.com/sveltejs/svelte/pull/14749))

- fix: remove unwanted properties from both replaced and unreplaced nodes ([#14744](https://github.com/sveltejs/svelte/pull/14744))

## 5.14.3

### Patch Changes

- fix: bump esrap, prevent malformed AST ([#14742](https://github.com/sveltejs/svelte/pull/14742))

- fix: compare array contents for equality mismatch detections, not the arrays themselves ([#14738](https://github.com/sveltejs/svelte/pull/14738))

## 5.14.2

### Patch Changes

- fix: correctly highlight first rerun of `$inspect.trace` ([#14734](https://github.com/sveltejs/svelte/pull/14734))

- chore: more loose parser improvements ([#14733](https://github.com/sveltejs/svelte/pull/14733))

## 5.14.1

### Patch Changes

- fix: improve unowned derived performance ([#14724](https://github.com/sveltejs/svelte/pull/14724))

## 5.14.0

### Minor Changes

- feat: adds $inspect.trace rune ([#14290](https://github.com/sveltejs/svelte/pull/14290))

## 5.13.0

### Minor Changes

- feat: add `outro` option to `unmount` ([#14540](https://github.com/sveltejs/svelte/pull/14540))

- feat: provide loose parser mode ([#14691](https://github.com/sveltejs/svelte/pull/14691))

## 5.12.0

### Minor Changes

- feat: expose more AST types from `"svelte/compiler"` ([#14601](https://github.com/sveltejs/svelte/pull/14601))

### Patch Changes

- fix: don't add parenthesis to media query if already present ([#14699](https://github.com/sveltejs/svelte/pull/14699))

- fix: ensure if block paths retain correct template namespacing ([#14685](https://github.com/sveltejs/svelte/pull/14685))

## 5.11.3

### Patch Changes

- fix: allow unquoted slash in attributes ([#14615](https://github.com/sveltejs/svelte/pull/14615))

- fix: better handle hydration of script/style elements ([#14683](https://github.com/sveltejs/svelte/pull/14683))

- fix: make `defaultValue` work with spread ([#14640](https://github.com/sveltejs/svelte/pull/14640))

- fix: avoid mutation validation for invalidate_inner_signals ([#14688](https://github.com/sveltejs/svelte/pull/14688))

## 5.11.2

### Patch Changes

- fix: correctly handle ssr for `reactivity/window` ([#14681](https://github.com/sveltejs/svelte/pull/14681))

## 5.11.1

### Patch Changes

- fix: account for global block in `is_empty` ([#14677](https://github.com/sveltejs/svelte/pull/14677))

- fix: remove overzealous `reactive_declaration_non_reactive_property` warning ([#14663](https://github.com/sveltejs/svelte/pull/14663))

## 5.11.0

### Minor Changes

- feat: add `svelte/reactivity/window` module ([#14660](https://github.com/sveltejs/svelte/pull/14660))

### Patch Changes

- fix: take into account registration state when setting custom element props ([#14508](https://github.com/sveltejs/svelte/pull/14508))

## 5.10.1

### Patch Changes

- fix: ensure snippet hoisting works in the correct scope ([#14642](https://github.com/sveltejs/svelte/pull/14642))

- fix: ensure $state.snapshot clones holey arrays correctly ([#14657](https://github.com/sveltejs/svelte/pull/14657))

- fix: restore input binding selection position ([#14649](https://github.com/sveltejs/svelte/pull/14649))

- fix: transform everything that is not a selector inside `:global` ([#14577](https://github.com/sveltejs/svelte/pull/14577))

- Overwrite Spring.#last_value when using .set() with {instant: true} ([#14656](https://github.com/sveltejs/svelte/pull/14656))

- fix: don't emit assignment warnings for bindings ([#14651](https://github.com/sveltejs/svelte/pull/14651))

## 5.10.0

### Minor Changes

- feat: provide links to documentation for errors/warnings ([#14629](https://github.com/sveltejs/svelte/pull/14629))

### Patch Changes

- fix: allow exports with source from script module even if no bind is present ([#14620](https://github.com/sveltejs/svelte/pull/14620))

- fix: deconflict `get_name` for literal class properties ([#14607](https://github.com/sveltejs/svelte/pull/14607))

## 5.9.1

### Patch Changes

- fix: mark subtree dynamic for bind with sequence expressions ([#14626](https://github.com/sveltejs/svelte/pull/14626))

## 5.9.0

### Minor Changes

- feat: add support for bind getters/setters ([#14307](https://github.com/sveltejs/svelte/pull/14307))

### Patch Changes

- fix: always run `if` block code the first time ([#14597](https://github.com/sveltejs/svelte/pull/14597))

## 5.8.1

### Patch Changes

- fix: reinstate missing prefersReducedMotion export ([#14586](https://github.com/sveltejs/svelte/pull/14586))

## 5.8.0

### Minor Changes

- feat: add `Spring` and `Tween` classes to `svelte/motion` ([#11519](https://github.com/sveltejs/svelte/pull/11519))

## 5.7.1

### Patch Changes

- fix: ensure bindings always take precedence over spreads ([#14575](https://github.com/sveltejs/svelte/pull/14575))

## 5.7.0

### Minor Changes

- feat: add `createSubscriber` function for creating reactive values that depend on subscriptions ([#14422](https://github.com/sveltejs/svelte/pull/14422))

- feat: add reactive `MediaQuery` class, and a `prefersReducedMotion` class instance ([#14422](https://github.com/sveltejs/svelte/pull/14422))

### Patch Changes

- fix: treat `undefined` and `null` the same for the initial input value ([#14562](https://github.com/sveltejs/svelte/pull/14562))

## 5.6.2

### Patch Changes

- chore: make if blocks tree-shakable ([#14549](https://github.com/sveltejs/svelte/pull/14549))

## 5.6.1

### Patch Changes

- fix: handle static form values in combination with default values ([#14555](https://github.com/sveltejs/svelte/pull/14555))

## 5.6.0

### Minor Changes

- feat: support `defaultValue/defaultChecked` for inputs ([#14289](https://github.com/sveltejs/svelte/pull/14289))

## 5.5.4

### Patch Changes

- fix: better error messages for invalid HTML trees ([#14445](https://github.com/sveltejs/svelte/pull/14445))

- fix: remove spreaded event handlers when they become nullish ([#14546](https://github.com/sveltejs/svelte/pull/14546))

- fix: respect the unidirectional nature of time ([#14541](https://github.com/sveltejs/svelte/pull/14541))

## 5.5.3

### Patch Changes

- fix: don't try to add owners to non-`$state` class fields ([#14533](https://github.com/sveltejs/svelte/pull/14533))

- fix: capture infinite_loop_guard in error boundary ([#14534](https://github.com/sveltejs/svelte/pull/14534))

- fix: proxify values when assigning using `||=`, `&&=` and `??=` operators ([#14273](https://github.com/sveltejs/svelte/pull/14273))

## 5.5.2

### Patch Changes

- fix: use correct reaction when lazily creating deriveds inside `SvelteDate` ([#14525](https://github.com/sveltejs/svelte/pull/14525))

## 5.5.1

### Patch Changes

- fix: don't throw with nullish actions ([#13559](https://github.com/sveltejs/svelte/pull/13559))

- fix: leave update expressions untransformed unless a transformer is provided ([#14507](https://github.com/sveltejs/svelte/pull/14507))

- chore: turn reactive_declaration_non_reactive_property into a runtime warning ([#14192](https://github.com/sveltejs/svelte/pull/14192))

## 5.5.0

### Minor Changes

- feat: allow snippets to be exported from module scripts ([#14315](https://github.com/sveltejs/svelte/pull/14315))

### Patch Changes

- fix: ignore TypeScript generics on variables ([#14509](https://github.com/sveltejs/svelte/pull/14509))

## 5.4.0

### Minor Changes

- feat: support `#each` without `as` ([#14396](https://github.com/sveltejs/svelte/pull/14396))

## 5.3.2

### Patch Changes

- fix: correctly prune CSS for elements inside snippets ([#14494](https://github.com/sveltejs/svelte/pull/14494))

- fix: render attributes during SSR regardless of case ([#14492](https://github.com/sveltejs/svelte/pull/14492))

## 5.3.1

### Patch Changes

- fix: treat spread elements the same as call expressions ([#14488](https://github.com/sveltejs/svelte/pull/14488))

- fix: correctly increment/decrement bigints ([#14485](https://github.com/sveltejs/svelte/pull/14485))

## 5.3.0

### Minor Changes

- feat: add error boundaries with `<svelte:boundary>` ([#14211](https://github.com/sveltejs/svelte/pull/14211))

## 5.2.12

### Patch Changes

- fix: upgrade to esm-env 1.2.1 to fix issues with non-Vite setups ([#14470](https://github.com/sveltejs/svelte/pull/14470))

- fix: prevent infinite loops when pruning CSS ([#14474](https://github.com/sveltejs/svelte/pull/14474))

- fix: generate correct code when encountering object expression statement ([#14480](https://github.com/sveltejs/svelte/pull/14480))

## 5.2.11

### Patch Changes

- fix: ignore text and expressions outside the template when validating HTML ([#14468](https://github.com/sveltejs/svelte/pull/14468))

- fix: better account for render tags when pruning CSS ([#14456](https://github.com/sveltejs/svelte/pull/14456))

## 5.2.10

### Patch Changes

- fix: correctly remove unused selectors in middle of selector lists ([#14448](https://github.com/sveltejs/svelte/pull/14448))

- chore: upgrade esm-env for Vite 6 support ([#14460](https://github.com/sveltejs/svelte/pull/14460))

- fix: strip exported TypeScript function overloads ([#14458](https://github.com/sveltejs/svelte/pull/14458))

## 5.2.9

### Patch Changes

- fix: show `:then` block for `null/undefined` value ([#14440](https://github.com/sveltejs/svelte/pull/14440))

- fix: relax html parent validation ([#14442](https://github.com/sveltejs/svelte/pull/14442))

- fix: prevent memory leak when creating deriveds inside untrack ([#14443](https://github.com/sveltejs/svelte/pull/14443))

- fix: disregard TypeScript nodes when pruning CSS ([#14446](https://github.com/sveltejs/svelte/pull/14446))

## 5.2.8

### Patch Changes

- fix: correctly prune each blocks ([#14403](https://github.com/sveltejs/svelte/pull/14403))

- fix: provide temporary `LegacyComponentType` ([#14257](https://github.com/sveltejs/svelte/pull/14257))

- fix: attach spread attribute events synchronously ([#14387](https://github.com/sveltejs/svelte/pull/14387))

- fix: ensure last empty text node correctly hydrates ([#14425](https://github.com/sveltejs/svelte/pull/14425))

- fix: correctly prune key blocks ([#14403](https://github.com/sveltejs/svelte/pull/14403))

## 5.2.7

### Patch Changes

- fix: always use set for private identifiers ([#14378](https://github.com/sveltejs/svelte/pull/14378))

## 5.2.6

### Patch Changes

- fix: remove template expression inlining ([#14374](https://github.com/sveltejs/svelte/pull/14374))

## 5.2.5

### Patch Changes

- fix: correctly handle srcObject attribute on video elements ([#14369](https://github.com/sveltejs/svelte/pull/14369))

- add `contentvisibilityautostatechange` event to element definitions ([#14373](https://github.com/sveltejs/svelte/pull/14373))

- fix: tighten up `export default` validation ([#14368](https://github.com/sveltejs/svelte/pull/14368))

- fix: include method definitions in class private fields ([#14365](https://github.com/sveltejs/svelte/pull/14365))

## 5.2.4

### Patch Changes

- fix: ensure internal cloning can work circular values ([#14347](https://github.com/sveltejs/svelte/pull/14347))

- fix: correctly update dynamic member expressions ([#14359](https://github.com/sveltejs/svelte/pull/14359))

- fix: ensure is_pure takes into account $effect.tracking() ([#14333](https://github.com/sveltejs/svelte/pull/14333))

- fix: coerce value to number when hydrating range/number input with changed value ([#14349](https://github.com/sveltejs/svelte/pull/14349))

## 5.2.3

### Patch Changes

- fix: ensure dynamic call expressions correctly generate output ([#14345](https://github.com/sveltejs/svelte/pull/14345))

## 5.2.2

### Patch Changes

- fix: treat property accesses of literals as pure ([#14325](https://github.com/sveltejs/svelte/pull/14325))

## 5.2.1

### Patch Changes

- fix: mark pseudo classes nested inside `:not` as used ([#14303](https://github.com/sveltejs/svelte/pull/14303))

- fix: disallow invalid attributes for `<svelte:window>` and `<svelte:document>` ([#14228](https://github.com/sveltejs/svelte/pull/14228))

- fix: ensure props passed to components via mount are updateable ([#14210](https://github.com/sveltejs/svelte/pull/14210))

- fix: mark subtree dynamic for img with loading attribute ([#14317](https://github.com/sveltejs/svelte/pull/14317))

- fix: avoid relying on Node specifics within compiler ([#14314](https://github.com/sveltejs/svelte/pull/14314))

## 5.2.0

### Minor Changes

- feat: better inlining of static attributes ([#14269](https://github.com/sveltejs/svelte/pull/14269))

## 5.1.17

### Patch Changes

- fix: account for `:has(...)` as part of `:root` ([#14229](https://github.com/sveltejs/svelte/pull/14229))

- fix: prevent nested pseudo class from being marked as unused ([#14229](https://github.com/sveltejs/svelte/pull/14229))

- fix: use strict equality for key block comparisons in runes mode ([#14285](https://github.com/sveltejs/svelte/pull/14285))

- fix: bump `is-reference` dependency to fix `import.meta` bug ([#14286](https://github.com/sveltejs/svelte/pull/14286))

## 5.1.16

### Patch Changes

- fix: don't wrap pseudo classes inside `:global(...)` with another `:global(...)` during migration ([#14267](https://github.com/sveltejs/svelte/pull/14267))

- fix: bail on named slots with that have reserved keywords during migration ([#14278](https://github.com/sveltejs/svelte/pull/14278))

## 5.1.15

### Patch Changes

- fix: consider static attributes that are inlined in the template ([#14249](https://github.com/sveltejs/svelte/pull/14249))

## 5.1.14

### Patch Changes

- fix: migration script messing with attributes ([#14260](https://github.com/sveltejs/svelte/pull/14260))

- fix: do not treat reassigned synthetic binds as state in runes mode ([#14236](https://github.com/sveltejs/svelte/pull/14236))

- fix: account for mutations in script module in ownership check ([#14253](https://github.com/sveltejs/svelte/pull/14253))

- fix: consider img with loading attribute not static ([#14237](https://github.com/sveltejs/svelte/pull/14237))

## 5.1.13

### Patch Changes

- fix: add migration task when there's a variable named that would conflict with a rune ([#14216](https://github.com/sveltejs/svelte/pull/14216))

- fix: consider `valueOf` in the reactive methods of `SvelteDate` ([#14227](https://github.com/sveltejs/svelte/pull/14227))

- fix: handle sibling combinators within `:has` ([#14213](https://github.com/sveltejs/svelte/pull/14213))

- fix: consider variables with synthetic store sub as state ([#14195](https://github.com/sveltejs/svelte/pull/14195))

- fix: read index as a source in legacy keyed each block ([#14208](https://github.com/sveltejs/svelte/pull/14208))

- fix: account for shadowing children slot during migration ([#14224](https://github.com/sveltejs/svelte/pull/14224))

- fix: ensure explicit nesting selector is always applied ([#14193](https://github.com/sveltejs/svelte/pull/14193))

- fix: add `lang="ts"` attribute during migration if needed ([#14222](https://github.com/sveltejs/svelte/pull/14222))

## 5.1.12

### Patch Changes

- fix: ignore `as` type expressions on property definitions ([#14181](https://github.com/sveltejs/svelte/pull/14181))

- fix: restore active reaction if then block throws ([#14191](https://github.com/sveltejs/svelte/pull/14191))

- chore: adds legacy mode flag reducing bundle size in runes mode only apps ([#14180](https://github.com/sveltejs/svelte/pull/14180))

## 5.1.11

### Patch Changes

- fix: error on TypeScript's `readonly` modifier ([#14153](https://github.com/sveltejs/svelte/pull/14153))

- fix: remove scoping for `:not` selectors ([#14177](https://github.com/sveltejs/svelte/pull/14177))

## 5.1.10

### Patch Changes

- fix: ensure non-matching elements are scoped for `:not(...)` selector ([#13999](https://github.com/sveltejs/svelte/pull/13999))

- fix: ensure video elements autoplay in safari ([#14095](https://github.com/sveltejs/svelte/pull/14095))

- fix: ensure trailing multiline comments on props produce correct code (#14143#issuecomment-2455702689) ([#14143](https://github.com/sveltejs/svelte/pull/14143))

- fix: correctly infer `<a>` tag namespace ([#14134](https://github.com/sveltejs/svelte/pull/14134))

- fix: check options namespace for top level `svelte:element`s ([#14101](https://github.com/sveltejs/svelte/pull/14101))

- fix: ensure migrate keeps inline/trailing comments in $props type definition ([#14143](https://github.com/sveltejs/svelte/pull/14143))

- fix: update links in JSDoc ([#14165](https://github.com/sveltejs/svelte/pull/14165))

- fix: ensure SvelteMap and SvelteSet work with generators in dev ([#14103](https://github.com/sveltejs/svelte/pull/14103))

- fix: only output the key for each_key_duplicate ([#14147](https://github.com/sveltejs/svelte/pull/14147))

- fix: prevent migrated snippet from shadow snippet prop ([#14127](https://github.com/sveltejs/svelte/pull/14127))

- fix: pass along `anchor` in legacy class wrappers ([#14100](https://github.com/sveltejs/svelte/pull/14100))

- fix: recognize all custom element prop definitions ([#14084](https://github.com/sveltejs/svelte/pull/14084))

- fix: migrate multiple declarations with only some exported correctly ([#14126](https://github.com/sveltejs/svelte/pull/14126))

## 5.1.9

### Patch Changes

- fix: ensure transitions are applied to nested elements ([#14080](https://github.com/sveltejs/svelte/pull/14080))

## 5.1.8

### Patch Changes

- fix: ensure compiler statements are correctly included ([#14074](https://github.com/sveltejs/svelte/pull/14074))

## 5.1.7

### Patch Changes

- fix: ensure each block inert items are disposed of if the each block is also inert ([#13930](https://github.com/sveltejs/svelte/pull/13930))

- fix: allow `warningFilter` option for `compileModule` ([#14066](https://github.com/sveltejs/svelte/pull/14066))

- fix: ensure onMount correctly fires when new expressions are used ([#14049](https://github.com/sveltejs/svelte/pull/14049))

- fix: wrap `:id`, `:where``:not` and `:has` with `:global` during migration ([#13850](https://github.com/sveltejs/svelte/pull/13850))

- fix: ensure custom element attribute/prop changes are in their own context ([#14016](https://github.com/sveltejs/svelte/pull/14016))

## 5.1.6

### Patch Changes

- fix: ensure child effects are destroyed before their deriveds ([#14043](https://github.com/sveltejs/svelte/pull/14043))

## 5.1.5

### Patch Changes

- fix: replace typo in compiler error messages ([#14044](https://github.com/sveltejs/svelte/pull/14044))

- fix: preserve the separator between selectors when an unused selector is in between ([#13954](https://github.com/sveltejs/svelte/pull/13954))

- fix: more robust re-subscribe detection for `fromStore` ([#13995](https://github.com/sveltejs/svelte/pull/13995))

- fix: allow to pass in TS preference to migration ([#13929](https://github.com/sveltejs/svelte/pull/13929))

- fix: extend derived/state validation error to indirect exports ([#14039](https://github.com/sveltejs/svelte/pull/14039))

- fix: minify inject CSS in prod mode ([#14006](https://github.com/sveltejs/svelte/pull/14006))

- fix: ensure toStore subscription correctly syncs latest value ([#14015](https://github.com/sveltejs/svelte/pull/14015))

- fix: don't access `requestAnimationFrame` until needed to reduce need for mocks during testing ([#14040](https://github.com/sveltejs/svelte/pull/14040))

- fix: ensure element effects are executed in the correct order ([#14038](https://github.com/sveltejs/svelte/pull/14038))

- fix: make compiler error extend from `Error` ([#14036](https://github.com/sveltejs/svelte/pull/14036))

## 5.1.4

### Patch Changes

- fix: add empty stack to `CompileDiagnostic` to show error on build ([#13942](https://github.com/sveltejs/svelte/pull/13942))

- fix: ensure effect_tracking correctly handles tracking reactions ([#14005](https://github.com/sveltejs/svelte/pull/14005))

- fix: update broken links ([#13944](https://github.com/sveltejs/svelte/pull/13944))

- fix: more exhaustive check during `SvelteMap.set` in deriveds ([#13951](https://github.com/sveltejs/svelte/pull/13951))

- fix: trim whitespace while migrating blocks ([#13941](https://github.com/sveltejs/svelte/pull/13941))

- fix: update links that previously pointed to preview site ([#14001](https://github.com/sveltejs/svelte/pull/14001))

- fix: properly migrate imports types prefixed with $ ([#14007](https://github.com/sveltejs/svelte/pull/14007))

## 5.1.3

### Patch Changes

- fix: rethrow errors from await block if no catch block exists ([#13819](https://github.com/sveltejs/svelte/pull/13819))

- fix: ensure SVG element attributes have case preserved ([#13935](https://github.com/sveltejs/svelte/pull/13935))

- fix: ensure bind:group works as intended with proxied state objects ([#13939](https://github.com/sveltejs/svelte/pull/13939))

- fix: ensure value is correctly set to zero on the progress element ([#13924](https://github.com/sveltejs/svelte/pull/13924))

- fix: skip comment nodes in snippet validation logic ([#13936](https://github.com/sveltejs/svelte/pull/13936))

- fix: typo in `Action` types ([#13874](https://github.com/sveltejs/svelte/pull/13874))

- fix: remove metadata from legacy AST ([#13927](https://github.com/sveltejs/svelte/pull/13927))

## 5.1.2

### Patch Changes

- fix: improve consistency of transitions ([#13895](https://github.com/sveltejs/svelte/pull/13895))

- fix: enable bound store props in runes mode components ([#13887](https://github.com/sveltejs/svelte/pull/13887))

- fix: ensure each block references to imports are handled correctly ([#13892](https://github.com/sveltejs/svelte/pull/13892))

- fix: ensure SvelteMap reactivity persists through deriveds ([#13877](https://github.com/sveltejs/svelte/pull/13877))

- fix: ensure snippets after empty text correctly hydrate ([#13870](https://github.com/sveltejs/svelte/pull/13870))

- fix: prevent migration script from adding `props.` to the `export let` identifier ([#13899](https://github.com/sveltejs/svelte/pull/13899))

- fix: prevent var name clashing for delegated events without params ([#13896](https://github.com/sveltejs/svelte/pull/13896))

## 5.1.1

### Patch Changes

- fix: internally wrap store subscribe in untrack ([#13858](https://github.com/sveltejs/svelte/pull/13858))

- fix: allow binding to const with spread in legacy mode ([#13849](https://github.com/sveltejs/svelte/pull/13849))

- fix: ensure props internally untracks current_value on sets ([#13859](https://github.com/sveltejs/svelte/pull/13859))

- fix: properly traverse children when checking matches for `:has` ([#13866](https://github.com/sveltejs/svelte/pull/13866))

## 5.1.0

### Minor Changes

- feat: export mount() options as the MountOptions type ([#13674](https://github.com/sveltejs/svelte/pull/13674))

- feat: allow usage of getContext() within $derived runes ([#13830](https://github.com/sveltejs/svelte/pull/13830))

### Patch Changes

- fix: properly migrate ts with inferred type comments ([#13761](https://github.com/sveltejs/svelte/pull/13761))

- fix: correct property name conversion in custom transitions ([#13820](https://github.com/sveltejs/svelte/pull/13820))

- fix: ensure $effect.tracking returns false inside transition functions ([#13775](https://github.com/sveltejs/svelte/pull/13775))

- fix: migrate default slots to children snippet ([#13760](https://github.com/sveltejs/svelte/pull/13760))

- fix: don't print errors on migration errors ([#13754](https://github.com/sveltejs/svelte/pull/13754))

- fix: prevent spread attribute from overriding class directive ([#13763](https://github.com/sveltejs/svelte/pull/13763))

- fix: ensure `:has` selectors followed by other selectors match ([#13824](https://github.com/sveltejs/svelte/pull/13824))

- fix: ensure muted DOM property works correctly in FF ([#13751](https://github.com/sveltejs/svelte/pull/13751))

- fix: show filename information in `legacy_recursive_reactive_block` ([#13764](https://github.com/sveltejs/svelte/pull/13764))

## 5.0.5

### Patch Changes

- fix: mark `:has` selectors with multiple preceding selectors as used ([#13750](https://github.com/sveltejs/svelte/pull/13750))

- fix: ensure event context is reset before invoking callback ([#13737](https://github.com/sveltejs/svelte/pull/13737))

- fix: add more robust check for `Element` prototype ([#13744](https://github.com/sveltejs/svelte/pull/13744))

- fix: do not comment out unused selectors that are inside an unused selector ([#13746](https://github.com/sveltejs/svelte/pull/13746))

- fix: more accurately detect `$derived` migration opportunities ([#13740](https://github.com/sveltejs/svelte/pull/13740))

- fix: @debug does not work with proxied-state ([#13690](https://github.com/sveltejs/svelte/pull/13690))

- fix: do not add jsdoc if no types found ([#13738](https://github.com/sveltejs/svelte/pull/13738))

## 5.0.4

### Patch Changes

- fix: webview preload tag can be any string ([#13733](https://github.com/sveltejs/svelte/pull/13733))

- fix: better children snippet / default slot interop ([#13734](https://github.com/sveltejs/svelte/pull/13734))

## 5.0.3

### Patch Changes

- chore: ensure transition events are dispatched without current reaction ([#13719](https://github.com/sveltejs/svelte/pull/13719))

## 5.0.2

### Patch Changes

- fix: don't blank css on migration error ([#13703](https://github.com/sveltejs/svelte/pull/13703))

## 5.0.1

### Patch Changes

- fix: use typedef for JSDoc props and maintain comments ([#13698](https://github.com/sveltejs/svelte/pull/13698))

## 5.0.0

A new major version of Svelte has been released! 🎉

The new version brings:

- even better performance,
- a more granular reactivity system with runes,
- more expressive template syntax with snippets and event attributes,
- native TypeScript support,
- and backwards compatibility with the previous syntax!

For more details check out the [Svelte docs](https://svelte-omnisite.vercel.app/) and the [migration guide](https://svelte-omnisite.vercel.app/docs/svelte/v5-migration-guide).

## 5.0.0-next.272

### Patch Changes

- fix: ensure user effects are correctly executed on initialisation ([#13697](https://github.com/sveltejs/svelte/pull/13697))

- breaking: state mutations inside the template are no longer allowed ([#13660](https://github.com/sveltejs/svelte/pull/13660))

## 5.0.0-next.271

### Patch Changes

- fix: avoid chromium issue with dispatching blur on element removal ([#13694](https://github.com/sveltejs/svelte/pull/13694))

## 5.0.0-next.270

### Patch Changes

- fix: bail out if slot name changes and $slots assigned to variable ([#13678](https://github.com/sveltejs/svelte/pull/13678))

- feat: add `migration-task` for impossible to migrate slots ([#13658](https://github.com/sveltejs/svelte/pull/13658))

- feat: tell users of `@migration-task` ([#13668](https://github.com/sveltejs/svelte/pull/13668))

- fix: correct migration of uninitialised state ([#13673](https://github.com/sveltejs/svelte/pull/13673))

- fix: ensure migrate correctly handles named slots ([#13676](https://github.com/sveltejs/svelte/pull/13676))

- feat: add `migration-task` comment after errors ([#13659](https://github.com/sveltejs/svelte/pull/13659))

- fix: migrate reactive statements with inner blocks ([#13675](https://github.com/sveltejs/svelte/pull/13675))

- fix: migrating rest props type includes props types ([#13632](https://github.com/sveltejs/svelte/pull/13632))

- fix: migrated snippet shadowing prop and let directive removal ([#13679](https://github.com/sveltejs/svelte/pull/13679))

- chore: CompileDiagnostic no longer extends Error ([#13651](https://github.com/sveltejs/svelte/pull/13651))

- fix: reset `reset_element` in `render` to prevent runtime error ([#13669](https://github.com/sveltejs/svelte/pull/13669))

## 5.0.0-next.269

### Patch Changes

- fix: transitions within dynamic components now function correctly ([#13646](https://github.com/sveltejs/svelte/pull/13646))

- fix: use `internal_set` in `await` block ([#13642](https://github.com/sveltejs/svelte/pull/13642))

- fix: correctly applies autofocus to static elements ([#13648](https://github.com/sveltejs/svelte/pull/13648))

- fix: `method` attribute is case insensitive ([#13639](https://github.com/sveltejs/svelte/pull/13639))

- chore: avoid reporting inspections when an exception occurs ([#13601](https://github.com/sveltejs/svelte/pull/13601))

- fix: ensure legacy run utility does not cause cycles ([#13643](https://github.com/sveltejs/svelte/pull/13643))

- fix: better migration for leading and trailing comments ([#13630](https://github.com/sveltejs/svelte/pull/13630))

## 5.0.0-next.268

### Patch Changes

- breaking: disallow state mutations in logic block expression ([#13625](https://github.com/sveltejs/svelte/pull/13625))

- breaking: stronger enumerated types ([#13624](https://github.com/sveltejs/svelte/pull/13624))

- chore: improve runtime performance of derived signals ([#13626](https://github.com/sveltejs/svelte/pull/13626))

## 5.0.0-next.267

### Patch Changes

- fix: ensure inserted code is preserved during migration ([#13617](https://github.com/sveltejs/svelte/pull/13617))

- fix: ensure each block consistency to internal mutations to the collection ([#13614](https://github.com/sveltejs/svelte/pull/13614))

- chore: improve derived ownership model ([#13623](https://github.com/sveltejs/svelte/pull/13623))

- fix: ensure await block scope transforms are isolated ([#13622](https://github.com/sveltejs/svelte/pull/13622))

## 5.0.0-next.266

### Patch Changes

- feat: add hidden until-found and beforematch ([#13612](https://github.com/sveltejs/svelte/pull/13612))

- fix: ensure local prop value is read during teardown ([#13611](https://github.com/sveltejs/svelte/pull/13611))

- fix: take snippets into account when scoping CSS ([#13589](https://github.com/sveltejs/svelte/pull/13589))

- breaking: scope `:not(...)` selectors ([#13568](https://github.com/sveltejs/svelte/pull/13568))

- breaking: scope `:has(...)` selectors ([#13567](https://github.com/sveltejs/svelte/pull/13567))

## 5.0.0-next.265

### Patch Changes

- fix: ensure source and filename are known to compileModule's source map ([#13546](https://github.com/sveltejs/svelte/pull/13546))

- fix: cleanup non-branch effects created inside block effects ([#13600](https://github.com/sveltejs/svelte/pull/13600))

- fix: do no rerun the each block when array change from empty to empty ([#13553](https://github.com/sveltejs/svelte/pull/13553))

- fix: ensure effects destroy owned deriveds upon teardown ([#13563](https://github.com/sveltejs/svelte/pull/13563))

- fix: ensure proxied arrays correctly update their length upon deletions ([#13549](https://github.com/sveltejs/svelte/pull/13549))

- fix: avoid assigning input.value if the value is the same to fix `minlength` ([#13574](https://github.com/sveltejs/svelte/pull/13574))

- fix: use `analysis.name` when migrating `<svelte:self>` ([#13544](https://github.com/sveltejs/svelte/pull/13544))

- fix: strip BOM character from input ([#13548](https://github.com/sveltejs/svelte/pull/13548))

## 5.0.0-next.264

### Patch Changes

- fix: exclude custom elements from HTML tree validation ([#13540](https://github.com/sveltejs/svelte/pull/13540))

- fix: apply class/style directives after attributes ([#13535](https://github.com/sveltejs/svelte/pull/13535))

- fix: make immutable option work more correctly ([#13526](https://github.com/sveltejs/svelte/pull/13526))

- breaking: use `<svelte-css-wrapper>` instead of `<div>` for style props ([#13499](https://github.com/sveltejs/svelte/pull/13499))

- fix: mark custom element with virtual class attribute as dynamic ([#13435](https://github.com/sveltejs/svelte/pull/13435))

- fix: ensure set_text applies coercion to objects before diff ([#13542](https://github.com/sveltejs/svelte/pull/13542))

## 5.0.0-next.263

### Patch Changes

- fix: add media listeners immediately when using `bind:paused` ([#13502](https://github.com/sveltejs/svelte/pull/13502))

- fix: further improve reconciliation of inert each block rows ([#13527](https://github.com/sveltejs/svelte/pull/13527))

- feat: add types for the search element ([#13489](https://github.com/sveltejs/svelte/pull/13489))

- feat: support migrating `svelte:self` ([#13504](https://github.com/sveltejs/svelte/pull/13504))

- feat: support migration of single assignment labeled statements ([#13461](https://github.com/sveltejs/svelte/pull/13461))

- fix: correctly migrate `$slots` with bracket member expressions & slots with static props ([#13468](https://github.com/sveltejs/svelte/pull/13468))

- feat: migrate slot usages ([#13500](https://github.com/sveltejs/svelte/pull/13500))

- fix: recreate `SvelteDate` methods deriveds if they are destroyed ([#13515](https://github.com/sveltejs/svelte/pull/13515))

- fix: allow imports from `svelte/legacy` in SSR ([#13523](https://github.com/sveltejs/svelte/pull/13523))

## 5.0.0-next.262

### Patch Changes

- feat: enable snippets to fill slots ([#13427](https://github.com/sveltejs/svelte/pull/13427))

- fix: strip internal properties from rest props during SSR ([#13492](https://github.com/sveltejs/svelte/pull/13492))

- fix: allow combinator at start of nested CSS selector ([#13440](https://github.com/sveltejs/svelte/pull/13440))

## 5.0.0-next.261

### Patch Changes

- fix: migrate `$Props` without creating non existent props ([#13484](https://github.com/sveltejs/svelte/pull/13484))

- feat: support migration of `svelte:component` ([#13437](https://github.com/sveltejs/svelte/pull/13437))

- feat: fix accessors and support migration of accessors ([#13456](https://github.com/sveltejs/svelte/pull/13456))

- fix: move labeled statements that need reordering after props insertion point ([#13480](https://github.com/sveltejs/svelte/pull/13480))

- feat: support migration of self closing tags ([#13479](https://github.com/sveltejs/svelte/pull/13479))

- fix: various `svelte:component` migration bugs ([#13473](https://github.com/sveltejs/svelte/pull/13473))

- fix: exclude type-only props from instance exports when migrating ([#13485](https://github.com/sveltejs/svelte/pull/13485))

## 5.0.0-next.260

### Patch Changes

- fix: ensure use directives execute in the correct sequence ([#13384](https://github.com/sveltejs/svelte/pull/13384))

- fix: blank CSS contents while migrating ([#13403](https://github.com/sveltejs/svelte/pull/13403))

- fix: avoid migrating slots in custom elements ([#13406](https://github.com/sveltejs/svelte/pull/13406))

- fix: don't consider children of rules when checking whether they are used or not ([#13410](https://github.com/sveltejs/svelte/pull/13410))

- fix: treat `<img>` alt attribute as content for a11y labelling purposes ([#13411](https://github.com/sveltejs/svelte/pull/13411))

- fix: make ownership widening more robust to userland proxies ([#13377](https://github.com/sveltejs/svelte/pull/13377))

- fix: validation should not fail on anonymous declarations ([#13393](https://github.com/sveltejs/svelte/pull/13393))

## 5.0.0-next.259

### Patch Changes

- fix: higher fidelity event migration ([#13362](https://github.com/sveltejs/svelte/pull/13362))

- fix: properly remove root anchor node on unmount ([#13381](https://github.com/sveltejs/svelte/pull/13381))

- fix: improve reconciliation of inert each block rows ([#13379](https://github.com/sveltejs/svelte/pull/13379))

## 5.0.0-next.258

### Patch Changes

- fix: only use getComputedStyle with elements ([#13366](https://github.com/sveltejs/svelte/pull/13366))

- fix: make each items reassignable in legacy mode ([#12257](https://github.com/sveltejs/svelte/pull/12257))

## 5.0.0-next.257

### Patch Changes

- fix: only set attribute as property if element has setter ([#13341](https://github.com/sveltejs/svelte/pull/13341))

## 5.0.0-next.256

### Patch Changes

- fix: only warn on context="module" in runes mode ([#13332](https://github.com/sveltejs/svelte/pull/13332))

- feat: deprecate `<svelte:self>` in runes mode ([#13333](https://github.com/sveltejs/svelte/pull/13333))

- fix: set strings as attributes, non-strings as properties if property exists ([#13327](https://github.com/sveltejs/svelte/pull/13327))

## 5.0.0-next.255

### Patch Changes

- fix: keep bound inputs in sync in runes mode ([#13328](https://github.com/sveltejs/svelte/pull/13328))

- fix: silence snapshot warnings inside `$inspect` ([#13334](https://github.com/sveltejs/svelte/pull/13334))

## 5.0.0-next.254

### Patch Changes

- feat: account for `zoom` when calculating animation transforms ([#13317](https://github.com/sveltejs/svelte/pull/13317))

## 5.0.0-next.253

### Patch Changes

- fix: delete transformers shadowed by unreassigned state ([#13316](https://github.com/sveltejs/svelte/pull/13316))

- fix: don't make wheel events passive by default ([#13322](https://github.com/sveltejs/svelte/pull/13322))

## 5.0.0-next.252

### Patch Changes

- fix: handle `$Props` interface during migration ([#13305](https://github.com/sveltejs/svelte/pull/13305))

- fix: attach effects-inside-deriveds to the parent of the derived ([#13309](https://github.com/sveltejs/svelte/pull/13309))

- fix: simplify and robustify appending styles ([#13303](https://github.com/sveltejs/svelte/pull/13303))

## 5.0.0-next.251

### Patch Changes

- fix: improve performance of scheduling effects ([#13300](https://github.com/sveltejs/svelte/pull/13300))

## 5.0.0-next.250

### Patch Changes

- fix: correctly migrate sequence expressions ([#13291](https://github.com/sveltejs/svelte/pull/13291))

- fix: avoid disconnecting deriveds that are still active ([#13292](https://github.com/sveltejs/svelte/pull/13292))

- feat: Add accessibility warnings for buttons and anchors without explicit labels and content ([#13130](https://github.com/sveltejs/svelte/pull/13130))

## 5.0.0-next.249

### Patch Changes

- fix: ensure snapshot logs don't affect dependency graph ([#13286](https://github.com/sveltejs/svelte/pull/13286))

- fix: allow custom element styles to be updated in HMR mode ([#13225](https://github.com/sveltejs/svelte/pull/13225))

- fix: inject styles correctly when mounting inside an iframe ([#13225](https://github.com/sveltejs/svelte/pull/13225))

## 5.0.0-next.248

### Patch Changes

- feat: provide guidance in browser console when logging $state objects ([#13142](https://github.com/sveltejs/svelte/pull/13142))

- fix: ensure correct parent effect is associated with render effects ([#13274](https://github.com/sveltejs/svelte/pull/13274))

- feat: unwrap function expressions where possible, and optimise bindings ([#13269](https://github.com/sveltejs/svelte/pull/13269))

## 5.0.0-next.247

### Patch Changes

- fix: wait until template strings are complete before sanitizing ([#13262](https://github.com/sveltejs/svelte/pull/13262))

- fix: avoid flushing sync with $inspect ([#13239](https://github.com/sveltejs/svelte/pull/13239))

- fix: separate `template_effect` for dynamic class/style directive with dynamic attributes ([#13171](https://github.com/sveltejs/svelte/pull/13171))

- fix: treat pure call expressions as potentially reactive if they reference local bindings ([#13264](https://github.com/sveltejs/svelte/pull/13264))

- fix: follow spec for `customElement` option ([#13247](https://github.com/sveltejs/svelte/pull/13247))

- fix: tighten up `# svelte prefix validation ([#13261](https://github.com/sveltejs/svelte/pull/13261))

## 5.0.0-next.246

### Patch Changes

- perf: inline module variables into template ([#13075](https://github.com/sveltejs/svelte/pull/13075))

- fix: allow custom element events on slot to bubble inside custom element ([#13222](https://github.com/sveltejs/svelte/pull/13222))

- fix: add missing `autocomplete` attribute tokens ([#13229](https://github.com/sveltejs/svelte/pull/13229))

- feat: add infinite loop effect callstack ([#13231](https://github.com/sveltejs/svelte/pull/13231))

## 5.0.0-next.245

### Patch Changes

- fix: visit expression for `svelte:component` references ([#13151](https://github.com/sveltejs/svelte/pull/13151))

- fix: ensure signal graph is consistent before triggering $inspect signals ([#13153](https://github.com/sveltejs/svelte/pull/13153))

- feat: better types for the `autocomplete` attribute ([#13201](https://github.com/sveltejs/svelte/pull/13201))

- fix: widen ownership upon property access if necessary ([#13175](https://github.com/sveltejs/svelte/pull/13175))

- fix: don't show `state_referenced_locally` warning on types ([#13177](https://github.com/sveltejs/svelte/pull/13177))

- fix: ensure locally mutated bindable props persist with spreading props ([#13190](https://github.com/sveltejs/svelte/pull/13190))

- fix: try catch `strict_equals` to avoid error accessing `STATE_SYMBOL` ([#13216](https://github.com/sveltejs/svelte/pull/13216))

- fix: ensure types are easier to follow for TypeScript ([#13140](https://github.com/sveltejs/svelte/pull/13140))

- fix: ensure $inspect effects are fine-grain ([#13199](https://github.com/sveltejs/svelte/pull/13199))

- fix: ensure unowned derived signals correctly re-connect to graph ([#13184](https://github.com/sveltejs/svelte/pull/13184))

- fix: ensure inner script tags are properly removed ([#13152](https://github.com/sveltejs/svelte/pull/13152))

- chore: improve ssr parent validation ([#13158](https://github.com/sveltejs/svelte/pull/13158))

- fix: prevent nullish snippet for rendering empty content ([#13083](https://github.com/sveltejs/svelte/pull/13083))

- fix: allow more characters in the unicode range as component identifiers ([#13198](https://github.com/sveltejs/svelte/pull/13198))

- fix: allow for nesting selector in pseudoclasses ([#13209](https://github.com/sveltejs/svelte/pull/13209))

- fix: ensure StyleDirective and ClassDirective are marked as dynamic ([#13205](https://github.com/sveltejs/svelte/pull/13205))

## 5.0.0-next.244

### Patch Changes

- fix: error on duplicate style and class directive ([#13097](https://github.com/sveltejs/svelte/pull/13097))

- fix: ensure $host rune correctly compiles in variable declarations ([#13127](https://github.com/sveltejs/svelte/pull/13127))

- fix: remove unnecessary update assignments ([#13113](https://github.com/sveltejs/svelte/pull/13113))

- fix: error at compile time on unsupported TypeScript language features ([#12982](https://github.com/sveltejs/svelte/pull/12982))

- fix: Ensure imports are above other statements ([#13132](https://github.com/sveltejs/svelte/pull/13132))

## 5.0.0-next.243

### Patch Changes

- fix: ensure reactive graph is fully traversed in the marking phase for non-runes mode ([#13059](https://github.com/sveltejs/svelte/pull/13059))

- fix: ensure reactivity system remains consistent with removals ([#13087](https://github.com/sveltejs/svelte/pull/13087))

- fix: render undefined html as the empty string ([#13092](https://github.com/sveltejs/svelte/pull/13092))

- fix: error on incorrect attributes for svelte:body ([#13084](https://github.com/sveltejs/svelte/pull/13084))

- feat: provide AST node types with internal types stripped out ([#12968](https://github.com/sveltejs/svelte/pull/12968))

## 5.0.0-next.242

### Patch Changes

- fix: insert comment before text in an each block, to prevent glued nodes ([#13073](https://github.com/sveltejs/svelte/pull/13073))

- feat: better generated each block code in SSR mode ([#13060](https://github.com/sveltejs/svelte/pull/13060))

## 5.0.0-next.241

### Patch Changes

- fix: prevent div/0 when generating transition keyframes ([#13058](https://github.com/sveltejs/svelte/pull/13058))

- fix: error on invalid element name ([#13057](https://github.com/sveltejs/svelte/pull/13057))

- fix: better compile errors for invalid tag names/placement ([#13045](https://github.com/sveltejs/svelte/pull/13045))

- fix: ensure event currentTarget is reset after propagation logic ([#13042](https://github.com/sveltejs/svelte/pull/13042))

## 5.0.0-next.240

### Patch Changes

- fix: use WAAPI to control timing of JS-based animations ([#13018](https://github.com/sveltejs/svelte/pull/13018))

- fix: prevent binding to imports ([#13035](https://github.com/sveltejs/svelte/pull/13035))

- fix: never abort bidirectional transitions ([#13018](https://github.com/sveltejs/svelte/pull/13018))

## 5.0.0-next.239

### Patch Changes

- fix: properly handle proxied array length mutations ([#13026](https://github.com/sveltejs/svelte/pull/13026))

- fix: repair `href` attribute mismatches ([#13032](https://github.com/sveltejs/svelte/pull/13032))

## 5.0.0-next.238

### Patch Changes

- fix: always return true from `deleteProperty` trap ([#13008](https://github.com/sveltejs/svelte/pull/13008))

- fix: handle deletions of previously-unread state proxy properties ([#13008](https://github.com/sveltejs/svelte/pull/13008))

- fix: make internal sources ownerless ([#13013](https://github.com/sveltejs/svelte/pull/13013))

- fix: join text nodes separated by comments ([#13009](https://github.com/sveltejs/svelte/pull/13009))

## 5.0.0-next.237

### Patch Changes

- breaking: throw error if derived creates state and then depends on it ([#12985](https://github.com/sveltejs/svelte/pull/12985))

- fix: ensure assignments to state field inside constructor trigger effects ([#12985](https://github.com/sveltejs/svelte/pull/12985))

- fix: ensure $inspect works with SvelteMap and SvelteSet ([#12994](https://github.com/sveltejs/svelte/pull/12994))

- chore: default options.filename to "(unknown)" ([#12997](https://github.com/sveltejs/svelte/pull/12997))

- feat: allow non-synchronous legacy component instantiation ([#12970](https://github.com/sveltejs/svelte/pull/12970))

## 5.0.0-next.236

### Patch Changes

- fix: properly transform destructured `$derived.by` declarations ([#12984](https://github.com/sveltejs/svelte/pull/12984))

## 5.0.0-next.235

### Patch Changes

- chore: update client check for smaller bundle size ([#12975](https://github.com/sveltejs/svelte/pull/12975))

- fix: correctly hydrate empty raw blocks ([#12979](https://github.com/sveltejs/svelte/pull/12979))

## 5.0.0-next.234

### Patch Changes

- fix: allow deleting non-existent `$restProps` properties ([#12971](https://github.com/sveltejs/svelte/pull/12971))

- feat: only traverse trailing static nodes during hydration ([#12935](https://github.com/sveltejs/svelte/pull/12935))

## 5.0.0-next.233

### Patch Changes

- fix: more robust handling of var declarations ([#12949](https://github.com/sveltejs/svelte/pull/12949))

- fix: remove buggy `validate_dynamic_component` check ([#12960](https://github.com/sveltejs/svelte/pull/12960))

## 5.0.0-next.232

### Patch Changes

- breaking: remove `$state.link` rune pending further design work ([#12943](https://github.com/sveltejs/svelte/pull/12943))

- fix: ensure `$store` reads are properly transformed ([#12952](https://github.com/sveltejs/svelte/pull/12952))

- breaking: deprecate `context="module"` in favor of `module` ([#12948](https://github.com/sveltejs/svelte/pull/12948))

## 5.0.0-next.231

### Patch Changes

- breaking: remove callback from `$state.link` ([#12942](https://github.com/sveltejs/svelte/pull/12942))

## 5.0.0-next.230

### Patch Changes

- fix: align list of passive events with browser defaults ([#12933](https://github.com/sveltejs/svelte/pull/12933))

- fix: ensure `{#await}` scope shadowing is computed in the correct order ([#12945](https://github.com/sveltejs/svelte/pull/12945))

- fix: don't skip custom elements with attributes ([#12939](https://github.com/sveltejs/svelte/pull/12939))

## 5.0.0-next.229

### Patch Changes

- feat: add `$state.link` rune ([#12545](https://github.com/sveltejs/svelte/pull/12545))

- fix: allow mixing slots and snippets in custom elements mode ([#12929](https://github.com/sveltejs/svelte/pull/12929))

- fix: small legibility improvement in `Snippet` type hint ([#12928](https://github.com/sveltejs/svelte/pull/12928))

- feat: support HMR with custom elements ([#12926](https://github.com/sveltejs/svelte/pull/12926))

- feat: error on invalid component name ([#12821](https://github.com/sveltejs/svelte/pull/12821))

## 5.0.0-next.228

### Patch Changes

- feat: skip over static nodes in compiled client code ([#12914](https://github.com/sveltejs/svelte/pull/12914))

## 5.0.0-next.227

### Patch Changes

- breaking: disallow `Object.defineProperty` on state proxies with non-basic descriptors ([#12916](https://github.com/sveltejs/svelte/pull/12916))

- breaking: allow frozen objects to be proxied ([#12916](https://github.com/sveltejs/svelte/pull/12916))

- breaking: avoid mutations to underlying proxied object with $state ([#12916](https://github.com/sveltejs/svelte/pull/12916))

- breaking: remove $state.is rune ([#12916](https://github.com/sveltejs/svelte/pull/12916))

## 5.0.0-next.226

### Patch Changes

- fix: ensure typings for `<svelte:options>` are picked up ([#12903](https://github.com/sveltejs/svelte/pull/12903))

- fix: exclude local declarations from non-reactive property warnings ([#12909](https://github.com/sveltejs/svelte/pull/12909))

## 5.0.0-next.225

### Patch Changes

- chore: improve the performance of set_text for single expressions ([#12893](https://github.com/sveltejs/svelte/pull/12893))

- fix: add cleanup function signature to `createRawSnippet` ([#12894](https://github.com/sveltejs/svelte/pull/12894))

- feat: more efficient checking for missing SSR text node ([#12891](https://github.com/sveltejs/svelte/pull/12891))

- fix: ensure nullish expressions render empty text ([#12898](https://github.com/sveltejs/svelte/pull/12898))

## 5.0.0-next.224

### Patch Changes

- chore: inline start and end node properties into effect ([#12878](https://github.com/sveltejs/svelte/pull/12878))

- fix: correctly ensure prop bindings are reactive when bound ([#12879](https://github.com/sveltejs/svelte/pull/12879))

- fix: remove sapper bindings ([#12875](https://github.com/sveltejs/svelte/pull/12875))

- chore: refactor internal signal dependency heuristic ([#12881](https://github.com/sveltejs/svelte/pull/12881))

- fix: allow store as initial value for props in ssr ([#12885](https://github.com/sveltejs/svelte/pull/12885))

## 5.0.0-next.223

### Patch Changes

- fix: treat module-level imports as non-reactive in legacy mode ([#12845](https://github.com/sveltejs/svelte/pull/12845))

- breaking: remove foreign namespace ([#12869](https://github.com/sveltejs/svelte/pull/12869))

- feat: more efficient text-only fragments ([#12864](https://github.com/sveltejs/svelte/pull/12864))

- fix: ensure outro animation is not prematurely aborted ([#12865](https://github.com/sveltejs/svelte/pull/12865))

- chore: improve performance of DOM traversal operations ([#12863](https://github.com/sveltejs/svelte/pull/12863))

- feat: better destructuring assignments ([#12872](https://github.com/sveltejs/svelte/pull/12872))

- fix: stricter `crossorigin` and `wrap` attributes types ([#12858](https://github.com/sveltejs/svelte/pull/12858))

## 5.0.0-next.222

### Patch Changes

- fix: avoid throwing `store_invalid_subscription_module` for runes ([#12848](https://github.com/sveltejs/svelte/pull/12848))

- fix: omit `$index` parameter where possible ([#12851](https://github.com/sveltejs/svelte/pull/12851))

- feat: skip over static subtrees ([#12849](https://github.com/sveltejs/svelte/pull/12849))

- chore: set `binding.kind` before analysis ([#12843](https://github.com/sveltejs/svelte/pull/12843))

- feat: better compiler warnings for non-reactive dependencies of reactive statements ([#12824](https://github.com/sveltejs/svelte/pull/12824))

- fix: skip unnecessary `$legacy` flag ([#12850](https://github.com/sveltejs/svelte/pull/12850))

## 5.0.0-next.221

### Patch Changes

- fix: ensure onwheel is passive by default ([#12837](https://github.com/sveltejs/svelte/pull/12837))

- chore: improve signal perf by using Set rather than array for reactions ([#12831](https://github.com/sveltejs/svelte/pull/12831))

- fix: ensure each key validation occurs for updates ([#12836](https://github.com/sveltejs/svelte/pull/12836))

## 5.0.0-next.220

### Patch Changes

- feat: warn on invalid event handlers ([#12818](https://github.com/sveltejs/svelte/pull/12818))

## 5.0.0-next.219

### Patch Changes

- feat: add compiler error when encountering a $-prefixed store value outside a .svelte file ([#12799](https://github.com/sveltejs/svelte/pull/12799))

## 5.0.0-next.218

### Patch Changes

- breaking: replace `$state.frozen` with `$state.raw` ([#12808](https://github.com/sveltejs/svelte/pull/12808))

- fix: ensure inspect effects are skipped from effect parent logic ([#12810](https://github.com/sveltejs/svelte/pull/12810))

## 5.0.0-next.217

### Patch Changes

- feat: deprecate `svelte:component` ([#12694](https://github.com/sveltejs/svelte/pull/12694))

- feat: treat tag with `.` as a component, even if lowercase ([#12798](https://github.com/sveltejs/svelte/pull/12798))

## 5.0.0-next.216

### Patch Changes

- feat: make custom element `tag` property optional ([#12754](https://github.com/sveltejs/svelte/pull/12754))

- fix: improved memory profile for transitions/animations ([#12796](https://github.com/sveltejs/svelte/pull/12796))

## 5.0.0-next.215

### Patch Changes

- fix: propagate custom element component prop changes ([#12774](https://github.com/sveltejs/svelte/pull/12774))

- fix: prevent numerous transition/animation memory leaks ([#12759](https://github.com/sveltejs/svelte/pull/12759))

## 5.0.0-next.214

### Patch Changes

- fix: ensure custom element styles append correctly during prod ([#12777](https://github.com/sveltejs/svelte/pull/12777))

- fix: invalidate signals following ++/-- inside each block ([#12780](https://github.com/sveltejs/svelte/pull/12780))

- feat: better code generation for destructuring assignments ([#12780](https://github.com/sveltejs/svelte/pull/12780))

## 5.0.0-next.213

### Patch Changes

- fix: ensure custom elements do not sync flush on mount ([#12787](https://github.com/sveltejs/svelte/pull/12787))

- fix: ensure event handlers referencing $host are not hoisted ([#12775](https://github.com/sveltejs/svelte/pull/12775))

- fix: provide more hydration mismatch coverage ([#12755](https://github.com/sveltejs/svelte/pull/12755))

- chore: simpler fallback values ([#12788](https://github.com/sveltejs/svelte/pull/12788))

## 5.0.0-next.212

### Patch Changes

- perf: speed up $.exclude_from_object ([#12783](https://github.com/sveltejs/svelte/pull/12783))

- chore: publish package provenance info ([#12779](https://github.com/sveltejs/svelte/pull/12779))

- feat: simplify derived object destructuring ([#12781](https://github.com/sveltejs/svelte/pull/12781))

## 5.0.0-next.211

### Patch Changes

- fix: improve prop binding warning validation for stores ([#12745](https://github.com/sveltejs/svelte/pull/12745))

- chore: add error for derived self referencing ([#12746](https://github.com/sveltejs/svelte/pull/12746))

- fix: skip `is_standalone` optimisation for dynamic components ([#12767](https://github.com/sveltejs/svelte/pull/12767))

- fix: ensure unowned deriveds correctly update ([#12747](https://github.com/sveltejs/svelte/pull/12747))

- fix: order of arguments for `push_element` in `svelte:element` ([#12763](https://github.com/sveltejs/svelte/pull/12763))

## 5.0.0-next.210

### Patch Changes

- fix: avoid recreating handlers for component events ([#12722](https://github.com/sveltejs/svelte/pull/12722))

- fix: call correct event handler for properties of non-reactive objects ([#12722](https://github.com/sveltejs/svelte/pull/12722))

## 5.0.0-next.209

### Patch Changes

- fix: add css hash to custom element rendered with `svelte:element` ([#12715](https://github.com/sveltejs/svelte/pull/12715))

- fix: correctly handle SvelteDate methods with arguments ([#12738](https://github.com/sveltejs/svelte/pull/12738))

- fix: add touch events on microtask to avoid Chromium bug ([#12735](https://github.com/sveltejs/svelte/pull/12735))

- fix: allow deletion of $restProps properties ([#12736](https://github.com/sveltejs/svelte/pull/12736))

- feat: more efficient code generation when referencing globals ([#12712](https://github.com/sveltejs/svelte/pull/12712))

## 5.0.0-next.208

### Patch Changes

- feat: add support for `<svelte:options css="injected" />` ([#12660](https://github.com/sveltejs/svelte/pull/12660))

- feat: function called as tagged template literal is reactively called ([#12692](https://github.com/sveltejs/svelte/pull/12692))

## 5.0.0-next.207

### Patch Changes

- fix: only create `document.title` effect if value is dynamic ([#12698](https://github.com/sveltejs/svelte/pull/12698))

## 5.0.0-next.206

### Patch Changes

- fix: allow nested `<dt>`/`<dd>` elements if they are within a `<dl>` element ([#12681](https://github.com/sveltejs/svelte/pull/12681))

- chore: internal refactoring of client transform visitors ([#12683](https://github.com/sveltejs/svelte/pull/12683))

## 5.0.0-next.205

### Patch Changes

- fix: always synchronously call `bind:this` ([#12679](https://github.com/sveltejs/svelte/pull/12679))

## 5.0.0-next.204

### Patch Changes

- feat: allow ignoring runtime warnings ([#12608](https://github.com/sveltejs/svelte/pull/12608))

- feat: perf tweaks for actions/styles/classes ([#12654](https://github.com/sveltejs/svelte/pull/12654))

## 5.0.0-next.203

### Patch Changes

- chore: internal compiler refactoring ([#12651](https://github.com/sveltejs/svelte/pull/12651))

- fix: widen `ComponentProps` constraint to accept more component shapes ([#12666](https://github.com/sveltejs/svelte/pull/12666))

- feat: make `<svelte:component>` unnecessary in runes mode ([#12646](https://github.com/sveltejs/svelte/pull/12646))

## 5.0.0-next.202

### Patch Changes

- fix: remove implicit passive behavior from OnDirective events ([#12645](https://github.com/sveltejs/svelte/pull/12645))

- fix: always set draggable through `setAttribute` to avoid weird behavior ([#12649](https://github.com/sveltejs/svelte/pull/12649))

## 5.0.0-next.201

### Patch Changes

- feat: remove $.unwrap calls from each block indexes ([#12640](https://github.com/sveltejs/svelte/pull/12640))

- fix: error on `bind:this` to each block parameter ([#12638](https://github.com/sveltejs/svelte/pull/12638))

- feat: remove `$.unwrap` calls from `bind:group` ([#12642](https://github.com/sveltejs/svelte/pull/12642))

## 5.0.0-next.200

### Patch Changes

- fix: never set custom element props as attributes inside templates ([#12622](https://github.com/sveltejs/svelte/pull/12622))

- feat: better code generation for `let:` directives in SSR mode ([#12611](https://github.com/sveltejs/svelte/pull/12611))

- fix: correctly update stores when reassigning with operator other than `=` ([#12614](https://github.com/sveltejs/svelte/pull/12614))

## 5.0.0-next.199

### Patch Changes

- fix: add missing hydration mismatch call-site ([#12604](https://github.com/sveltejs/svelte/pull/12604))

- fix: apply dynamic event fixes to OnDirective ([#12582](https://github.com/sveltejs/svelte/pull/12582))

- fix: ensure directives run in sequential order ([#12591](https://github.com/sveltejs/svelte/pull/12591))

- fix: tweak element_invalid_self_closing_tag to exclude namespace ([#12585](https://github.com/sveltejs/svelte/pull/12585))

- breaking: avoid flushing queued updates on mount/hydrate ([#12602](https://github.com/sveltejs/svelte/pull/12602))

- feat: allow `:global` in more places ([#12560](https://github.com/sveltejs/svelte/pull/12560))

## 5.0.0-next.198

### Patch Changes

- chore: remove internal `binding.expression` mechanism ([#12530](https://github.com/sveltejs/svelte/pull/12530))

- fix: exclude `bind:this` from reactive state validation ([#12566](https://github.com/sveltejs/svelte/pull/12566))

## 5.0.0-next.197

### Patch Changes

- fix: correctly set anchor inside HMR block ([#12575](https://github.com/sveltejs/svelte/pull/12575))

## 5.0.0-next.196

### Patch Changes

- fix: ensure dynamic event handlers are wrapped in a derived ([#12563](https://github.com/sveltejs/svelte/pull/12563))

- chore: tidy up dynamic event handler generated code ([#12553](https://github.com/sveltejs/svelte/pull/12553))

- fix: dynamic event delegation for stateful call expressions ([#12549](https://github.com/sveltejs/svelte/pull/12549))

- fix: ensure $state.snapshot correctly clones Date objects ([#12564](https://github.com/sveltejs/svelte/pull/12564))

- fix: remove runtime validation of components/snippets, rely on types instead ([#12507](https://github.com/sveltejs/svelte/pull/12507))

- fix: properly update store values ([#12562](https://github.com/sveltejs/svelte/pull/12562))

## 5.0.0-next.195

### Patch Changes

- fix: update original source in HMR update ([#12547](https://github.com/sveltejs/svelte/pull/12547))

## 5.0.0-next.194

### Patch Changes

- fix: bail-out of hydrating head if no anchor is found ([#12541](https://github.com/sveltejs/svelte/pull/12541))

- chore: add warning for invalid render function of createRawSnippet ([#12535](https://github.com/sveltejs/svelte/pull/12535))

- fix: correctly set filename on HMR wrappers ([#12543](https://github.com/sveltejs/svelte/pull/12543))

- fix: only emit binding_property_non_reactive warning in runes mode ([#12544](https://github.com/sveltejs/svelte/pull/12544))

## 5.0.0-next.193

### Patch Changes

- fix: improve validation error that occurs when using `{@render ...}` to render default slotted content ([#12521](https://github.com/sveltejs/svelte/pull/12521))

- fix: reset hydrate node after `hydrate(...)` ([#12512](https://github.com/sveltejs/svelte/pull/12512))

## 5.0.0-next.192

### Patch Changes

- fix: make animations more robust to quick shuffling ([#12496](https://github.com/sveltejs/svelte/pull/12496))

- feat: warn if binding to a non-reactive property ([#12500](https://github.com/sveltejs/svelte/pull/12500))

- fix: ensure $state proxy invokes set accessor if present ([#12503](https://github.com/sveltejs/svelte/pull/12503))

## 5.0.0-next.191

### Patch Changes

- fix: properly assign trailing comments ([#12471](https://github.com/sveltejs/svelte/pull/12471))

- breaking: remove deep reactivity from non-bindable props ([#12484](https://github.com/sveltejs/svelte/pull/12484))

- fix: ensure async initial store value is noticed ([#12486](https://github.com/sveltejs/svelte/pull/12486))

- fix: don't add imports to hoisted event parameters ([#12493](https://github.com/sveltejs/svelte/pull/12493))

- fix: set `volume` through DOM property rather than attribute ([#12485](https://github.com/sveltejs/svelte/pull/12485))

## 5.0.0-next.190

### Patch Changes

- fix: hydrate multiple `<svelte:head>` elements correctly ([#12475](https://github.com/sveltejs/svelte/pull/12475))

- fix: assign correct scope to attributes of named slot ([#12476](https://github.com/sveltejs/svelte/pull/12476))

- breaking: warn on quoted single-expression attributes in runes mode ([#12479](https://github.com/sveltejs/svelte/pull/12479))

## 5.0.0-next.189

### Patch Changes

- feat: add createRawSnippet API ([#12425](https://github.com/sveltejs/svelte/pull/12425))

## 5.0.0-next.188

### Patch Changes

- fix: ensure `$state.snapshot` never errors ([#12445](https://github.com/sveltejs/svelte/pull/12445))

- feat: move dev-time component properties to private symbols' ([#12461](https://github.com/sveltejs/svelte/pull/12461))

## 5.0.0-next.187

### Patch Changes

- fix: always pass original component to HMR wrapper ([#12454](https://github.com/sveltejs/svelte/pull/12454))

- fix: ensure previous transitions are properly aborted ([#12460](https://github.com/sveltejs/svelte/pull/12460))

## 5.0.0-next.186

### Patch Changes

- feat: skip pending block for already-resolved promises ([#12274](https://github.com/sveltejs/svelte/pull/12274))

- feat: add ability to ignore warnings through `warningFilter` compiler option ([#12296](https://github.com/sveltejs/svelte/pull/12296))

- fix: run animations in microtask so that deferred transitions can measure nodes correctly ([#12453](https://github.com/sveltejs/svelte/pull/12453))

## 5.0.0-next.185

### Patch Changes

- fix: allow leading and trailing comments in mustache expression ([#11866](https://github.com/sveltejs/svelte/pull/11866))

- fix: ensure hydration walks all nodes ([#12448](https://github.com/sveltejs/svelte/pull/12448))

- fix: prevent whitespaces merging across component boundaries ([#12449](https://github.com/sveltejs/svelte/pull/12449))

- fix: detect mutations within assignment expressions ([#12429](https://github.com/sveltejs/svelte/pull/12429))

## 5.0.0-next.184

### Patch Changes

- fix: show correct errors for invalid runes in `.svelte.js` files ([#12432](https://github.com/sveltejs/svelte/pull/12432))

- breaking: use structuredClone inside `$state.snapshot` ([#12413](https://github.com/sveltejs/svelte/pull/12413))

## 5.0.0-next.183

### Patch Changes

- fix: properly validate snippet/slot interop ([#12421](https://github.com/sveltejs/svelte/pull/12421))

- fix: cache call expressions in render tag arguments ([#12418](https://github.com/sveltejs/svelte/pull/12418))

- fix: optimize `bind:group` ([#12406](https://github.com/sveltejs/svelte/pull/12406))

## 5.0.0-next.182

### Patch Changes

- fix: abort outro when intro starts ([#12321](https://github.com/sveltejs/svelte/pull/12321))

- feat: warn in dev on `{@html ...}` block hydration mismatch ([#12396](https://github.com/sveltejs/svelte/pull/12396))

- feat: only create a maximum of one document event listener per event ([#12383](https://github.com/sveltejs/svelte/pull/12383))

- fix: disallow using `let:` directives with component render tags ([#12400](https://github.com/sveltejs/svelte/pull/12400))

- fix: mark variables in shorthand style directives as referenced ([#12392](https://github.com/sveltejs/svelte/pull/12392))

- fix: handle empty else if block in legacy AST ([#12397](https://github.com/sveltejs/svelte/pull/12397))

- fix: properly delay intro transitions ([#12389](https://github.com/sveltejs/svelte/pull/12389))

## 5.0.0-next.181

### Patch Changes

- fix: reflect SvelteURLSearchParams changes to SvelteURL ([#12285](https://github.com/sveltejs/svelte/pull/12285))

- fix: ensure hmr block effects are transparent for transitions ([#12384](https://github.com/sveltejs/svelte/pull/12384))

- feat: simpler HMR logic ([#12391](https://github.com/sveltejs/svelte/pull/12391))

## 5.0.0-next.180

### Patch Changes

- fix: handle nested `:global(...)` selectors ([#12365](https://github.com/sveltejs/svelte/pull/12365))

- feat: include CSS in `<head>` when `css: 'injected'` ([#12374](https://github.com/sveltejs/svelte/pull/12374))

- fix: destroy effects that error on creation ([#12376](https://github.com/sveltejs/svelte/pull/12376))

- breaking: rename `legacy.componentApi` to `compatibility.componentApi` ([#12370](https://github.com/sveltejs/svelte/pull/12370))

- fix: correctly validate `<svelte:component>` with `bind:this` ([#12368](https://github.com/sveltejs/svelte/pull/12368))

## 5.0.0-next.179

### Patch Changes

- fix: ensure `$slots` returns a record of booleans ([#12359](https://github.com/sveltejs/svelte/pull/12359))

- feat: single-pass hydration ([#12335](https://github.com/sveltejs/svelte/pull/12335))

## 5.0.0-next.178

### Patch Changes

- fix: reconnected deep derived signals to graph ([#12350](https://github.com/sveltejs/svelte/pull/12350))

## 5.0.0-next.177

### Patch Changes

- breaking: play transitions on `mount` by default ([#12351](https://github.com/sveltejs/svelte/pull/12351))

- fix: make `<select>` `<option value>` behavior consistent ([#12316](https://github.com/sveltejs/svelte/pull/12316))

- chore: stricter control flow syntax validation in runes mode ([#12342](https://github.com/sveltejs/svelte/pull/12342))

- fix: resolve legacy component props equality for mutations ([#12348](https://github.com/sveltejs/svelte/pull/12348))

- fix: make `$state` component exports settable ([#12345](https://github.com/sveltejs/svelte/pull/12345))

## 5.0.0-next.176

### Patch Changes

- fix: correct start of `{:else if}` and `{:else}` ([#12043](https://github.com/sveltejs/svelte/pull/12043))

- fix: reverse parent/child order in invalid HTML warning ([#12336](https://github.com/sveltejs/svelte/pull/12336))

- fix: reorder reactive statements during migration ([#12329](https://github.com/sveltejs/svelte/pull/12329))

- feat: better `<svelte:element>` SSR output ([#12339](https://github.com/sveltejs/svelte/pull/12339))

- chore: align warning and error objects, add frame property ([#12326](https://github.com/sveltejs/svelte/pull/12326))

- fix: ensure `$effect.root` is ignored on the server ([#12332](https://github.com/sveltejs/svelte/pull/12332))

- fix: enable local transitions on `svelte:element` ([#12346](https://github.com/sveltejs/svelte/pull/12346))

## 5.0.0-next.175

### Patch Changes

- fix: correctly compile $effect.root in svelte modules ([#12315](https://github.com/sveltejs/svelte/pull/12315))

- fix: ensure `bind:this` works with component with no return value ([#12290](https://github.com/sveltejs/svelte/pull/12290))

## 5.0.0-next.174

### Patch Changes

- fix: bail out of event hoisting when referencing store subscriptions ([#12301](https://github.com/sveltejs/svelte/pull/12301))

- chore: make store initialization logic simpler ([#12281](https://github.com/sveltejs/svelte/pull/12281))

- fix: make props optional during SSR ([#12284](https://github.com/sveltejs/svelte/pull/12284))

- fix: ensure each blocks properly handle $state.frozen objects in prod ([#12305](https://github.com/sveltejs/svelte/pull/12305))

- fix: ensure rest props access on hoisted event handlers works ([#12298](https://github.com/sveltejs/svelte/pull/12298))

- fix: lazily create a derived for each read method on `SvelteDate.prototype` ([#12110](https://github.com/sveltejs/svelte/pull/12110))

## 5.0.0-next.173

### Patch Changes

- chore: tidy up store logic ([#12277](https://github.com/sveltejs/svelte/pull/12277))

## 5.0.0-next.172

### Patch Changes

- fix: handle duplicate signal dependencies gracefully ([#12261](https://github.com/sveltejs/svelte/pull/12261))

## 5.0.0-next.171

### Patch Changes

- feat: simpler effect DOM boundaries ([#12258](https://github.com/sveltejs/svelte/pull/12258))

## 5.0.0-next.170

### Patch Changes

- fix: bump dts-buddy for better type generation ([#12262](https://github.com/sveltejs/svelte/pull/12262))

- breaking: expose `CompileError` interface, not class ([#12255](https://github.com/sveltejs/svelte/pull/12255))

## 5.0.0-next.169

### Patch Changes

- breaking: rename `svelte/reactivity` helpers to include `Svelte` prefix ([#12248](https://github.com/sveltejs/svelte/pull/12248))

- fix: avoid duplicate signal dependencies ([#12245](https://github.com/sveltejs/svelte/pull/12245))

## 5.0.0-next.168

### Patch Changes

- fix: ensure HMR doesn't mess with anchor nodes ([#12242](https://github.com/sveltejs/svelte/pull/12242))

- fix: deconflict multiple snippets of the same name ([#12221](https://github.com/sveltejs/svelte/pull/12221))

## 5.0.0-next.167

### Patch Changes

- fix: make more types from `svelte/compiler` public ([#12189](https://github.com/sveltejs/svelte/pull/12189))

- fix: support contenteditable binding undefined fallback ([#12210](https://github.com/sveltejs/svelte/pull/12210))

- breaking: prevent usage of arguments keyword in certain places ([#12191](https://github.com/sveltejs/svelte/pull/12191))

- fix(types): export CompileResult and Warning ([#12212](https://github.com/sveltejs/svelte/pull/12212))

- fix: ensure element dir properties persist with text changes ([#12204](https://github.com/sveltejs/svelte/pull/12204))

- fix: disallow accessing internal Svelte props ([#12207](https://github.com/sveltejs/svelte/pull/12207))

- fix: make media bindings more robust ([#12206](https://github.com/sveltejs/svelte/pull/12206))

- fix: allow slot attribute inside snippets ([#12188](https://github.com/sveltejs/svelte/pull/12188))

- feat: allow `let props = $props()` and optimize prop read access ([#12201](https://github.com/sveltejs/svelte/pull/12201))

- feat: improve type arguments for Snippet and $bindable ([#12197](https://github.com/sveltejs/svelte/pull/12197))

## 5.0.0-next.166

### Patch Changes

- fix: remove correct event listener from document ([#12101](https://github.com/sveltejs/svelte/pull/12101))

- fix: correctly serialize object assignment expressions ([#12175](https://github.com/sveltejs/svelte/pull/12175))

- fix: robustify migration script around indentation and comments ([#12176](https://github.com/sveltejs/svelte/pull/12176))

- fix: improve await block behaviour in non-runes mode ([#12179](https://github.com/sveltejs/svelte/pull/12179))

- fix: improve select handling of dynamic value with placeholders ([#12181](https://github.com/sveltejs/svelte/pull/12181))

## 5.0.0-next.165

### Patch Changes

- breaking: bump dts-buddy ([#12134](https://github.com/sveltejs/svelte/pull/12134))

- fix: throw compilation error for malformed snippets ([#12144](https://github.com/sveltejs/svelte/pull/12144))

## 5.0.0-next.164

### Patch Changes

- fix: prevent `a11y_label_has_associated_control` false positive for component or render tag in `<label>` ([#12119](https://github.com/sveltejs/svelte/pull/12119))

- fix: allow multiple optional parameters with defaults in snippets ([#12070](https://github.com/sveltejs/svelte/pull/12070))

## 5.0.0-next.163

### Patch Changes

- feat: more accurate `render`/`mount`/`hydrate` options ([#12111](https://github.com/sveltejs/svelte/pull/12111))

- fix: better binding interop between runes/non-runes components ([#12123](https://github.com/sveltejs/svelte/pull/12123))

## 5.0.0-next.162

### Patch Changes

- chore: remove anchor node from each block items ([#11836](https://github.com/sveltejs/svelte/pull/11836))

## 5.0.0-next.161

### Patch Changes

- fix: wait a microtask for await blocks to reduce UI churn ([#11989](https://github.com/sveltejs/svelte/pull/11989))

- fix: ensure state update expressions are serialised correctly ([#12109](https://github.com/sveltejs/svelte/pull/12109))

- fix: repair each block length even without an else ([#12098](https://github.com/sveltejs/svelte/pull/12098))

- fix: remove document event listeners on unmount ([#12105](https://github.com/sveltejs/svelte/pull/12105))

## 5.0.0-next.160

### Patch Changes

- chore: improve runtime performance of capturing reactive signals ([#12093](https://github.com/sveltejs/svelte/pull/12093))

## 5.0.0-next.159

### Patch Changes

- fix: ensure element size bindings don't unsubscribe multiple times from the resize observer ([#12091](https://github.com/sveltejs/svelte/pull/12091))

- fix: prevent misidentification of bindings as delegatable event handlers if used outside event attribute ([#12081](https://github.com/sveltejs/svelte/pull/12081))

- fix: preserve current input values when removing defaults ([#12083](https://github.com/sveltejs/svelte/pull/12083))

- fix: preserve component function context for nested components ([#12089](https://github.com/sveltejs/svelte/pull/12089))

## 5.0.0-next.158

### Patch Changes

- fix: adjust module declaration to work around language tools bug ([#12071](https://github.com/sveltejs/svelte/pull/12071))

## 5.0.0-next.157

### Patch Changes

- fix: handle `is` attribute on elements with spread ([#12056](https://github.com/sveltejs/svelte/pull/12056))

- fix: correctly process empty lines in messages ([#12057](https://github.com/sveltejs/svelte/pull/12057))

- fix: rewrite state_unsafe_mutation message ([#12059](https://github.com/sveltejs/svelte/pull/12059))

- fix: support function invocation from imported `*.svelte` components ([#12061](https://github.com/sveltejs/svelte/pull/12061))

- fix: better types for `on` ([#12053](https://github.com/sveltejs/svelte/pull/12053))

## 5.0.0-next.156

### Patch Changes

- fix: increment derived versions when updating ([#12047](https://github.com/sveltejs/svelte/pull/12047))

## 5.0.0-next.155

### Patch Changes

- fix: robustify migration script ([#12019](https://github.com/sveltejs/svelte/pull/12019))

- fix: relax constraint for `ComponentProps` ([#12026](https://github.com/sveltejs/svelte/pull/12026))

- fix: address event delegation duplication behaviour ([#12014](https://github.com/sveltejs/svelte/pull/12014))

- chore: remove `createRoot` references ([#12018](https://github.com/sveltejs/svelte/pull/12018))

- chore: clear `Map`/`Set` before triggering `$inspect` callbacks ([#12013](https://github.com/sveltejs/svelte/pull/12013))

- breaking: rename `$effect.active` to `$effect.tracking` ([#12022](https://github.com/sveltejs/svelte/pull/12022))

## 5.0.0-next.154

### Patch Changes

- fix: ensure bound input content is resumed on hydration ([#11986](https://github.com/sveltejs/svelte/pull/11986))

- fix: better `render` type ([#11997](https://github.com/sveltejs/svelte/pull/11997))

- fix: SSR template escaping ([#12007](https://github.com/sveltejs/svelte/pull/12007))

## 5.0.0-next.153

### Patch Changes

- feat: defer tasks without creating effects ([#11960](https://github.com/sveltejs/svelte/pull/11960))

- fix: enusre dev validation in dynamic component works as intended ([#11985](https://github.com/sveltejs/svelte/pull/11985))

- feat: detach inert effects ([#11955](https://github.com/sveltejs/svelte/pull/11955))

- feat: sort possible bindings in invalid binding error ([#11950](https://github.com/sveltejs/svelte/pull/11950))

- fix: apply style directives to element with empty style attribute ([#11971](https://github.com/sveltejs/svelte/pull/11971))

## 5.0.0-next.152

### Patch Changes

- fix: validate form inside a form ([#11947](https://github.com/sveltejs/svelte/pull/11947))

- fix: more robust handling of events in spread attributes ([#11942](https://github.com/sveltejs/svelte/pull/11942))

- feat: simpler `<svelte:element> hydration ([#11773](https://github.com/sveltejs/svelte/pull/11773))

- fix: make `legacy.componentApi` option more visible ([#11924](https://github.com/sveltejs/svelte/pull/11924))

- feat: simpler hydration of CSS custom property wrappers ([#11948](https://github.com/sveltejs/svelte/pull/11948))

- chore: optimise effects that only exist to return a teardown ([#11936](https://github.com/sveltejs/svelte/pull/11936))

- feat: always create wrapper `<div>` for `<svelte:component>` with CSS custom properties ([#11792](https://github.com/sveltejs/svelte/pull/11792))

- feat: add svelte/events package and export `on` function ([#11912](https://github.com/sveltejs/svelte/pull/11912))

- feat: more efficient output for attributes in SSR ([#11949](https://github.com/sveltejs/svelte/pull/11949))

- fix: update reactive set when deleting initial values ([#11967](https://github.com/sveltejs/svelte/pull/11967))

- feat: simpler string normalization ([#11954](https://github.com/sveltejs/svelte/pull/11954))

- fix: always assign text.nodeValue ([#11944](https://github.com/sveltejs/svelte/pull/11944))

## 5.0.0-next.151

### Patch Changes

- fix: relax `Component` type ([#11929](https://github.com/sveltejs/svelte/pull/11929))

- fix: sort `{@const ...}` tags topologically in legacy mode ([#11908](https://github.com/sveltejs/svelte/pull/11908))

- chore: deprecate html in favour of body for render() ([#11927](https://github.com/sveltejs/svelte/pull/11927))

- fix: append start/end info to `AssignmentPattern` and `VariableDeclarator` ([#11930](https://github.com/sveltejs/svelte/pull/11930))

- fix: relax slot prop validation on components ([#11923](https://github.com/sveltejs/svelte/pull/11923))

## 5.0.0-next.150

### Patch Changes

- fix: populate `this.#sources` when constructing reactive map ([#11913](https://github.com/sveltejs/svelte/pull/11913))

- fix: omit `state_referenced_locally` warning for component exports ([#11905](https://github.com/sveltejs/svelte/pull/11905))

- fix: ensure event.target is correct for delegation ([#11900](https://github.com/sveltejs/svelte/pull/11900))

- chore: speed up regex ([#11918](https://github.com/sveltejs/svelte/pull/11918))

- feat: bind `activeElement` and `pointerLockElement` in `<svelte:document>` ([#11879](https://github.com/sveltejs/svelte/pull/11879))

- fix: correctly backport `svelte:element` to old AST ([#11917](https://github.com/sveltejs/svelte/pull/11917))

- fix: add `unused-export-let` to legacy lint replacements ([#11896](https://github.com/sveltejs/svelte/pull/11896))

## 5.0.0-next.149

### Patch Changes

- fix: keep default values of props a proxy after reassignment ([#11860](https://github.com/sveltejs/svelte/pull/11860))

- fix: address map reactivity regression ([#11882](https://github.com/sveltejs/svelte/pull/11882))

- fix: assign message to error object in `handle_error` using `Object.defineProperty` ([#11675](https://github.com/sveltejs/svelte/pull/11675))

- fix: ensure frozen objects in state are correctly skipped ([#11889](https://github.com/sveltejs/svelte/pull/11889))

## 5.0.0-next.148

### Patch Changes

- chore: improve $state.frozen performance in prod ([#11852](https://github.com/sveltejs/svelte/pull/11852))

- breaking: removed deferred event updates ([#11855](https://github.com/sveltejs/svelte/pull/11855))

## 5.0.0-next.147

### Patch Changes

- fix: improve reactive Map and Set implementations ([#11827](https://github.com/sveltejs/svelte/pull/11827))

- fix: improve controlled each block cleanup performance ([#11839](https://github.com/sveltejs/svelte/pull/11839))

## 5.0.0-next.146

### Patch Changes

- fix: allow for more svelte-ignore to work ([#11833](https://github.com/sveltejs/svelte/pull/11833))

- fix: reevaluate namespace in slots ([#11849](https://github.com/sveltejs/svelte/pull/11849))

## 5.0.0-next.145

### Patch Changes

- fix: `$state.is` missing second argument on the server ([#11835](https://github.com/sveltejs/svelte/pull/11835))

- fix: prevent buggy ownership warning when reassigning state ([#11812](https://github.com/sveltejs/svelte/pull/11812))

- fix: address regressed memory leak ([#11832](https://github.com/sveltejs/svelte/pull/11832))

## 5.0.0-next.144

### Patch Changes

- fix: address derived memory leak on disconnection from reactive graph ([#11819](https://github.com/sveltejs/svelte/pull/11819))

- fix: set correct scope for `@const` tags within slots ([#11798](https://github.com/sveltejs/svelte/pull/11798))

- fix: better support for onwheel events in chrome ([#11808](https://github.com/sveltejs/svelte/pull/11808))

- fix: coherent infinite loop guard ([#11815](https://github.com/sveltejs/svelte/pull/11815))

- fix: make prop fallback values deeply reactive if needed ([#11804](https://github.com/sveltejs/svelte/pull/11804))

- fix: robustify initial scroll value detection when scroll is smooth ([#11802](https://github.com/sveltejs/svelte/pull/11802))

## 5.0.0-next.143

### Patch Changes

- feat: provide `Component` type that represents the new shape of Svelte components ([#11775](https://github.com/sveltejs/svelte/pull/11775))

## 5.0.0-next.142

### Patch Changes

- fix: allow runelike writable as prop ([#11768](https://github.com/sveltejs/svelte/pull/11768))

- fix: support `array.lastIndexOf` without second argument ([#11766](https://github.com/sveltejs/svelte/pull/11766))

- fix: handle `this` parameter in TypeScript-annotated functions ([#11795](https://github.com/sveltejs/svelte/pull/11795))

- fix: allow classes to be reassigned ([#11794](https://github.com/sveltejs/svelte/pull/11794))

- fix: capture the correct event names when spreading attributes ([#11783](https://github.com/sveltejs/svelte/pull/11783))

- fix: allow global next to `&` for nesting ([#11784](https://github.com/sveltejs/svelte/pull/11784))

- fix: parse ongotpointercapture and onlostpointercapture events correctly ([#11790](https://github.com/sveltejs/svelte/pull/11790))

- fix: only inject push/pop in SSR components when necessary ([#11771](https://github.com/sveltejs/svelte/pull/11771))

## 5.0.0-next.141

### Patch Changes

- fix: throw on invalid attribute expressions ([#11736](https://github.com/sveltejs/svelte/pull/11736))

- fix: use svg methods for updating svg attributes too ([#11755](https://github.com/sveltejs/svelte/pull/11755))

- fix: don't warn on link without href if aria-disabled ([#11737](https://github.com/sveltejs/svelte/pull/11737))

- fix: don't use console.trace inside dev warnings ([#11744](https://github.com/sveltejs/svelte/pull/11744))

## 5.0.0-next.140

### Patch Changes

- breaking: event handlers + bindings now yield effect updates ([#11706](https://github.com/sveltejs/svelte/pull/11706))

## 5.0.0-next.139

### Patch Changes

- fix: ensure we clear down each block opening anchors from document ([#11740](https://github.com/sveltejs/svelte/pull/11740))

## 5.0.0-next.138

### Patch Changes

- fix: allow comments after last selector in css ([#11723](https://github.com/sveltejs/svelte/pull/11723))

- fix: don't add scoping modifier to nesting selectors ([#11713](https://github.com/sveltejs/svelte/pull/11713))

- chore: speedup hydration around input and select values ([#11717](https://github.com/sveltejs/svelte/pull/11717))

- fix: update value like attributes in a separate template_effect ([#11720](https://github.com/sveltejs/svelte/pull/11720))

- fix: improve handling of unowned derived signal ([#11712](https://github.com/sveltejs/svelte/pull/11712))

## 5.0.0-next.137

### Patch Changes

- fix: migrate derivations without semicolons ([#11704](https://github.com/sveltejs/svelte/pull/11704))

- fix: check for invalid bindings on window and document ([#11676](https://github.com/sveltejs/svelte/pull/11676))

- fix: more efficient spread attributes in SSR output ([#11660](https://github.com/sveltejs/svelte/pull/11660))

- fix: inline pointer events now correctly work in Chrome ([#11695](https://github.com/sveltejs/svelte/pull/11695))

- fix: don't require warning codes to be separated by commas in non-runes mode ([#11669](https://github.com/sveltejs/svelte/pull/11669))

## 5.0.0-next.136

### Patch Changes

- chore: remove `handle_compile_error` ([#11639](https://github.com/sveltejs/svelte/pull/11639))

- breaking: disallow string literal values in `<svelte:element this="...">` ([#11454](https://github.com/sveltejs/svelte/pull/11454))

- fix: use coarse-grained updates for derived expressions passed to props in legacy mode ([#11652](https://github.com/sveltejs/svelte/pull/11652))

- fix: robustify `bind:scrollX/Y` binding ([#11655](https://github.com/sveltejs/svelte/pull/11655))

- feat: migrate `<svelte:element this="div">` ([#11659](https://github.com/sveltejs/svelte/pull/11659))

- feat: more information when hydration fails ([#11649](https://github.com/sveltejs/svelte/pull/11649))

- fix: replay load and error events on load during hydration ([#11642](https://github.com/sveltejs/svelte/pull/11642))

## 5.0.0-next.135

### Patch Changes

- fix: make messages more consistent ([#11643](https://github.com/sveltejs/svelte/pull/11643))

- feat: introduce `rootDir` compiler option, make `filename` relative to it ([#11627](https://github.com/sveltejs/svelte/pull/11627))

- fix: rename `__svelte_meta.filename` to `__svelte_meta.file` to align with svelte 4 ([#11627](https://github.com/sveltejs/svelte/pull/11627))

- fix: avoid state_referenced_locally warning within type annotations ([#11638](https://github.com/sveltejs/svelte/pull/11638))

## 5.0.0-next.134

### Patch Changes

- chore: improve SSR invalid element error message ([#11585](https://github.com/sveltejs/svelte/pull/11585))

- fix: deduplicate children prop and default slot ([#10800](https://github.com/sveltejs/svelte/pull/10800))

- feat: error on imports to `svelte/internal/*` ([#11632](https://github.com/sveltejs/svelte/pull/11632))

- fix: better handle img loading attribute ([#11635](https://github.com/sveltejs/svelte/pull/11635))

- feat: add $state.is rune ([#11613](https://github.com/sveltejs/svelte/pull/11613))

- feat: provide $state warnings for accidental equality ([#11610](https://github.com/sveltejs/svelte/pull/11610))

- feat: error when snippet shadow a prop ([#11631](https://github.com/sveltejs/svelte/pull/11631))

- chore: use `new CustomEvent` instead of deprecated `initCustomEvent` ([#11629](https://github.com/sveltejs/svelte/pull/11629))

## 5.0.0-next.133

### Patch Changes

- fix: add backwards-compat for old warning codes in legacy mode ([#11607](https://github.com/sveltejs/svelte/pull/11607))

## 5.0.0-next.132

### Patch Changes

- chore: improve runtime overhead of creating comment templates ([#11591](https://github.com/sveltejs/svelte/pull/11591))

- fix: replicate Svelte 4 props update detection in legacy mode ([#11577](https://github.com/sveltejs/svelte/pull/11577))

- fix: allow for non optional chain call expression in render ([#11578](https://github.com/sveltejs/svelte/pull/11578))

- fix: correctly handle falsy values of style directives in SSR mode ([#11583](https://github.com/sveltejs/svelte/pull/11583))

- fix: improve handling of lazy image elements ([#11593](https://github.com/sveltejs/svelte/pull/11593))

- fix: skip deriveds for props with known safe calls ([#11595](https://github.com/sveltejs/svelte/pull/11595))

## 5.0.0-next.131

### Patch Changes

- chore: optimise effects ([#11569](https://github.com/sveltejs/svelte/pull/11569))

- fix: ensure all effect cleanup functions are untracked ([#11567](https://github.com/sveltejs/svelte/pull/11567))

## 5.0.0-next.130

### Patch Changes

- fix: improve internal mechanism for handling process_effects ([#11560](https://github.com/sveltejs/svelte/pull/11560))

## 5.0.0-next.129

### Patch Changes

- fix: further adjust heuristics for effect_update_depth_exceeded ([#11558](https://github.com/sveltejs/svelte/pull/11558))

## 5.0.0-next.128

### Patch Changes

- fix: improved $inspect handling of reactive Map/Set/Date ([#11553](https://github.com/sveltejs/svelte/pull/11553))

- fix: adjust heuristics for effect_update_depth_exceeded ([#11557](https://github.com/sveltejs/svelte/pull/11557))

## 5.0.0-next.127

### Patch Changes

- fix: don't warn on writes to `$state` ([#11540](https://github.com/sveltejs/svelte/pull/11540))

- feat: provide better error messages in DEV ([#11526](https://github.com/sveltejs/svelte/pull/11526))

- fix: better support for lazy img elements ([#11545](https://github.com/sveltejs/svelte/pull/11545))

- fix: handle falsy prop aliases correctly ([#11539](https://github.com/sveltejs/svelte/pull/11539))

- fix: ensure spread events are added even when rerunning spread immediately ([#11535](https://github.com/sveltejs/svelte/pull/11535))

## 5.0.0-next.126

### Patch Changes

- fix: improve behaviour of unowned derived signals ([#11521](https://github.com/sveltejs/svelte/pull/11521))

- fix: make `$effect.active()` true when updating deriveds ([#11500](https://github.com/sveltejs/svelte/pull/11500))

- fix: skip parent element validation for snippet contents ([#11463](https://github.com/sveltejs/svelte/pull/11463))

## 5.0.0-next.125

### Patch Changes

- fix: coerce incremented/decremented sources ([#11506](https://github.com/sveltejs/svelte/pull/11506))

- feat: add support for svelte inspector ([#11514](https://github.com/sveltejs/svelte/pull/11514))

- fix: skip AST analysis of TypeScript AST nodes ([#11513](https://github.com/sveltejs/svelte/pull/11513))

- fix: use import.meta.hot.acceptExports when available to support partial hmr in vite ([#11453](https://github.com/sveltejs/svelte/pull/11453))

- feat: better error for `bind:this` legacy API usage ([#11498](https://github.com/sveltejs/svelte/pull/11498))

## 5.0.0-next.124

### Patch Changes

- fix: allow to access private fields after `this` reassignment ([#11487](https://github.com/sveltejs/svelte/pull/11487))

- fix: only initiate scroll if scroll binding has existing value ([#11469](https://github.com/sveltejs/svelte/pull/11469))

- fix: restore value after attribute removal during hydration ([#11465](https://github.com/sveltejs/svelte/pull/11465))

- fix: check if svelte component exists on custom element destroy ([#11488](https://github.com/sveltejs/svelte/pull/11488))

- fix: ensure derived is detected as dirty correctly ([#11496](https://github.com/sveltejs/svelte/pull/11496))

- fix: prevent false positive ownership warning ([#11490](https://github.com/sveltejs/svelte/pull/11490))

## 5.0.0-next.123

### Patch Changes

- fix: adjust order of `derived` function definition overloads ([#11426](https://github.com/sveltejs/svelte/pull/11426))

## 5.0.0-next.122

### Patch Changes

- fix: mark function properties on runes as deprecated for better intellisense ([#11439](https://github.com/sveltejs/svelte/pull/11439))

- fix: only warn about non-reactive state in runes mode ([#11434](https://github.com/sveltejs/svelte/pull/11434))

- fix: prevent ownership validation from infering with component context ([#11438](https://github.com/sveltejs/svelte/pull/11438))

- fix: ensure $inspect untracks inspected object ([#11432](https://github.com/sveltejs/svelte/pull/11432))

## 5.0.0-next.121

### Patch Changes

- fix: set correct component context when rendering snippets ([#11401](https://github.com/sveltejs/svelte/pull/11401))

- fix: detect style shorthands as stateful variables in legacy mode ([#11421](https://github.com/sveltejs/svelte/pull/11421))

- fix: improve unowned derived signal behaviour ([#11408](https://github.com/sveltejs/svelte/pull/11408))

- fix: rework binding type-checking strategy ([#11420](https://github.com/sveltejs/svelte/pull/11420))

- fix: improve html escaping of element attributes ([#11411](https://github.com/sveltejs/svelte/pull/11411))

## 5.0.0-next.120

### Patch Changes

- feat: MathML support ([#11387](https://github.com/sveltejs/svelte/pull/11387))

## 5.0.0-next.119

### Patch Changes

- fix: generate correct code for arrow functions with bodies involving object expressions ([#11392](https://github.com/sveltejs/svelte/pull/11392))

## 5.0.0-next.118

### Patch Changes

- fix: ensure no data loss occurs when using reactive Set methods ([#11385](https://github.com/sveltejs/svelte/pull/11385))

- fix: handle reassignment of `$props` and `$restProps` ([#11348](https://github.com/sveltejs/svelte/pull/11348))

- fix: disallow sequence expressions in `@const` tags ([#11357](https://github.com/sveltejs/svelte/pull/11357))

## 5.0.0-next.117

### Patch Changes

- fix: collect all necessary setters of html elements when spreading attributes ([#11371](https://github.com/sveltejs/svelte/pull/11371))

- fix: ensure reactions are kept dirty when marking them again ([#11364](https://github.com/sveltejs/svelte/pull/11364))

- feat: leave view transition pseudo selectors untouched ([#11375](https://github.com/sveltejs/svelte/pull/11375))

- fix: require whitespace after `@const` tag ([#11379](https://github.com/sveltejs/svelte/pull/11379))

## 5.0.0-next.116

### Patch Changes

- fix: correctly interpret empty aria- attribute ([#11325](https://github.com/sveltejs/svelte/pull/11325))

- fix: disallow mixing on:click and onclick syntax ([#11295](https://github.com/sveltejs/svelte/pull/11295))

- fix: make hr, script and template valid select children ([#11344](https://github.com/sveltejs/svelte/pull/11344))

- fix: apply modifiers to bubbled events ([#11369](https://github.com/sveltejs/svelte/pull/11369))

- fix: allow `bind:this` on `<select>` with dynamic `multiple` attribute ([#11378](https://github.com/sveltejs/svelte/pull/11378))

- feat: allow for literal property definition with state on classes ([#11326](https://github.com/sveltejs/svelte/pull/11326))

- fix: disallow mounting a snippet ([#11347](https://github.com/sveltejs/svelte/pull/11347))

- feat: only inject push/init/pop when necessary ([#11319](https://github.com/sveltejs/svelte/pull/11319))

- feat: provide migration helper ([#11334](https://github.com/sveltejs/svelte/pull/11334))

- fix: ensure store from props is hoisted correctly ([#11367](https://github.com/sveltejs/svelte/pull/11367))

## 5.0.0-next.115

### Patch Changes

- fix: remove `bind_prop` in runes mode ([#11321](https://github.com/sveltejs/svelte/pull/11321))

- fix: mark `accessors` and `immutable` as deprecated ([#11277](https://github.com/sveltejs/svelte/pull/11277))

## 5.0.0-next.114

### Patch Changes

- feat: introduce types to express bindability ([#11225](https://github.com/sveltejs/svelte/pull/11225))

## 5.0.0-next.113

### Patch Changes

- breaking: disallow binding to component exports in runes mode ([#11238](https://github.com/sveltejs/svelte/pull/11238))

## 5.0.0-next.112

### Patch Changes

- fix: avoid hoisting error by using 'let' instead of 'var' ([#11291](https://github.com/sveltejs/svelte/pull/11291))

## 5.0.0-next.111

### Patch Changes

- fix: run render functions for dynamic void elements ([#11258](https://github.com/sveltejs/svelte/pull/11258))

- fix: allow events to continue propagating following an error ([#11263](https://github.com/sveltejs/svelte/pull/11263))

- fix: resolve type definition error in `svelte/compiler` ([#11283](https://github.com/sveltejs/svelte/pull/11283))

- feat: include `script` and `svelte:options` attributes in ast ([#11241](https://github.com/sveltejs/svelte/pull/11241))

- fix: only destroy snippets when they have changed ([#11267](https://github.com/sveltejs/svelte/pull/11267))

- fix: add type arguments to Map and Set ([#10820](https://github.com/sveltejs/svelte/pull/10820))

- feat: implement `:global {...}` CSS blocks ([#11276](https://github.com/sveltejs/svelte/pull/11276))

- feat: add read-only `bind:focused` ([#11271](https://github.com/sveltejs/svelte/pull/11271))

## 5.0.0-next.110

### Patch Changes

- fix: make sure event attributes run after bindings ([#11230](https://github.com/sveltejs/svelte/pull/11230))

## 5.0.0-next.109

### Patch Changes

- fix: more robust moving of each item nodes ([#11254](https://github.com/sveltejs/svelte/pull/11254))

- fix: ensure that CSS is generated for the final frame of a transition ([#11251](https://github.com/sveltejs/svelte/pull/11251))

- fix: more accurate error message when creating orphan effects ([#11227](https://github.com/sveltejs/svelte/pull/11227))

- fix: support `$state.snapshot` as part of variable declarations ([#11235](https://github.com/sveltejs/svelte/pull/11235))

- fix: optimize object property mutations in compilation ([#11243](https://github.com/sveltejs/svelte/pull/11243))

- breaking: don't allow children in svelte:options ([#11250](https://github.com/sveltejs/svelte/pull/11250))

- fix: possible name clash in hoisted functions ([#11237](https://github.com/sveltejs/svelte/pull/11237))

- fix: preserve getters/setters in HMR mode ([#11231](https://github.com/sveltejs/svelte/pull/11231))

## 5.0.0-next.108

### Patch Changes

- breaking: warn on slots and event handlers in runes mode, error on `<slot>` + `{@render ...}` tag usage in same component ([#11203](https://github.com/sveltejs/svelte/pull/11203))

- fix: fall back to component namespace when not statically determinable, add way to tell `<svelte:element>` the namespace at runtime ([#11219](https://github.com/sveltejs/svelte/pull/11219))

- fix: measure elements before taking siblings out of the flow ([#11216](https://github.com/sveltejs/svelte/pull/11216))

- breaking: warn on self-closing non-void HTML tags ([#11114](https://github.com/sveltejs/svelte/pull/11114))

- fix: take outroing elements out of the flow when animating siblings ([#11208](https://github.com/sveltejs/svelte/pull/11208))

- fix: widen ownership when sub state is assigned to new state ([#11217](https://github.com/sveltejs/svelte/pull/11217))

## 5.0.0-next.107

### Patch Changes

- fix: refine css `:global()` selector checks in a compound selector ([#11142](https://github.com/sveltejs/svelte/pull/11142))

- fix: remove memory leak from bind:this ([#11194](https://github.com/sveltejs/svelte/pull/11194))

- fix: remove memory leak from retaining old DOM elements ([#11197](https://github.com/sveltejs/svelte/pull/11197))

- feat: add warning when using `$bindable` rune without calling it ([#11181](https://github.com/sveltejs/svelte/pull/11181))

## 5.0.0-next.106

### Patch Changes

- feat: use state proxy ancestry for ownership validation ([#11184](https://github.com/sveltejs/svelte/pull/11184))

- fix: make snippet effects transparent for transitions ([#11195](https://github.com/sveltejs/svelte/pull/11195))

- fix: return ast from `compile` (like Svelte 4 does) ([#11191](https://github.com/sveltejs/svelte/pull/11191))

- fix: ensure bind:this unmount behavior for members is conditional ([#11193](https://github.com/sveltejs/svelte/pull/11193))

## 5.0.0-next.105

### Patch Changes

- breaking: remove unstate(), replace with $state.snapshot rune ([#11180](https://github.com/sveltejs/svelte/pull/11180))

- fix: more accurate default value handling ([#11183](https://github.com/sveltejs/svelte/pull/11183))

## 5.0.0-next.104

### Patch Changes

- fix: ssr comments in head elements that require raw content ([#10936](https://github.com/sveltejs/svelte/pull/10936))

- fix: improve spreading of attributes ([#11177](https://github.com/sveltejs/svelte/pull/11177))

## 5.0.0-next.103

### Patch Changes

- fix: throw error when auto-subscribed store variable shadow by local variable ([#11170](https://github.com/sveltejs/svelte/pull/11170))

- fix: make ownership validation work correctly with HMR ([#11171](https://github.com/sveltejs/svelte/pull/11171))

- fix: revert ownership widening change ([#11161](https://github.com/sveltejs/svelte/pull/11161))

- fix: fix string name of reactive map and set iterator ([#11169](https://github.com/sveltejs/svelte/pull/11169))

- feat: reactive `URL` and `URLSearchParams` classes ([#11157](https://github.com/sveltejs/svelte/pull/11157))

- feat: update error message for snippet binding and assignments ([#11168](https://github.com/sveltejs/svelte/pull/11168))

## 5.0.0-next.102

### Patch Changes

- fix: generate correct types for reactive Map/Set/Date ([#11153](https://github.com/sveltejs/svelte/pull/11153))

## 5.0.0-next.101

### Patch Changes

- fix missing classes after dynamic expressions in class attribute ([#11134](https://github.com/sveltejs/svelte/pull/11134))

- feat: simplify HMR implementation ([#11132](https://github.com/sveltejs/svelte/pull/11132))

- fix: add validation around disallowed sequence expressions to element attributes ([#11149](https://github.com/sveltejs/svelte/pull/11149))

## 5.0.0-next.100

### Patch Changes

- fix: further improvements to hmr component key generation ([#11129](https://github.com/sveltejs/svelte/pull/11129))

## 5.0.0-next.99

### Patch Changes

- fix: use correct meta property for hmr key ([#11125](https://github.com/sveltejs/svelte/pull/11125))

## 5.0.0-next.98

### Patch Changes

- fix: use keys for hmr modules ([#11123](https://github.com/sveltejs/svelte/pull/11123))

- fix: addresses reactive Set bug in certain engines ([#11120](https://github.com/sveltejs/svelte/pull/11120))

## 5.0.0-next.97

### Patch Changes

- fix: loosen proxy signal creation heuristics ([#11109](https://github.com/sveltejs/svelte/pull/11109))

- fix: ensure top level snippets are defined when binding to component prop ([#11104](https://github.com/sveltejs/svelte/pull/11104))

- feat: hot module reloading support for Svelte 5 ([#11106](https://github.com/sveltejs/svelte/pull/11106))

## 5.0.0-next.96

### Patch Changes

- feat: introduce `$host` rune, deprecate `createEventDispatcher` ([#11059](https://github.com/sveltejs/svelte/pull/11059))

- fix: execute sole static script tag ([#11095](https://github.com/sveltejs/svelte/pull/11095))

- fix: make static `element` property available for the SvelteComponent type ([#11079](https://github.com/sveltejs/svelte/pull/11079))

- fix: improve internal proxied state signal heuristic ([#11102](https://github.com/sveltejs/svelte/pull/11102))

- fix: keep sibling selectors when dealing with slots/render tags/`svelte:element` tags ([#11096](https://github.com/sveltejs/svelte/pull/11096))

- fix: ensure deep mutation ownership widening ([#11094](https://github.com/sveltejs/svelte/pull/11094))

- fix: improve compiled output of multiple call expression in single text node ([#11097](https://github.com/sveltejs/svelte/pull/11097))

- fix: improve hydration of svelte head blocks ([#11099](https://github.com/sveltejs/svelte/pull/11099))

## 5.0.0-next.95

### Patch Changes

- breaking: robustify interop of exports and props in runes mode ([#11064](https://github.com/sveltejs/svelte/pull/11064))

- fix: improve handled of unowned derived signals ([#11077](https://github.com/sveltejs/svelte/pull/11077))

- fix: bundle CSS types ([#11067](https://github.com/sveltejs/svelte/pull/11067))

## 5.0.0-next.94

### Patch Changes

- fix: add `anchor` support to mount() API ([#11050](https://github.com/sveltejs/svelte/pull/11050))

## 5.0.0-next.93

### Patch Changes

- breaking: prevent unparenthesized sequence expressions in attributes ([#11032](https://github.com/sveltejs/svelte/pull/11032))

- fix: ensure transition errors are not swallowed ([#11039](https://github.com/sveltejs/svelte/pull/11039))

## 5.0.0-next.92

### Patch Changes

- fix: include compiler/package.json in package ([#11033](https://github.com/sveltejs/svelte/pull/11033))

## 5.0.0-next.91

### Patch Changes

- fix: improve unowned derived signal heuristics ([#11029](https://github.com/sveltejs/svelte/pull/11029))

- fix: ensure correct context for action update/destroy functions ([#11023](https://github.com/sveltejs/svelte/pull/11023))

- feat: more efficient hydration markers ([#11019](https://github.com/sveltejs/svelte/pull/11019))

- fix: ensure effect cleanup functions are called with null `this` ([#11024](https://github.com/sveltejs/svelte/pull/11024))

- fix: correctly handle closure passed to $derived.by when destructuring ([#11028](https://github.com/sveltejs/svelte/pull/11028))

- Add `name` to HTMLDetailsAttributes ([#11013](https://github.com/sveltejs/svelte/pull/11013))

- breaking: move compiler.cjs to compiler/index.js ([#10988](https://github.com/sveltejs/svelte/pull/10988))

## 5.0.0-next.90

### Patch Changes

- fix: hydrate HTML with surrounding whitespace ([#10996](https://github.com/sveltejs/svelte/pull/10996))

- feat: faster HTML tags ([#10986](https://github.com/sveltejs/svelte/pull/10986))

## 5.0.0-next.89

### Patch Changes

- fix: expose 'svelte/internal' to prevent Vite erroring on startup ([#10987](https://github.com/sveltejs/svelte/pull/10987))

- fix: revert SSR shorthand comments ([#10980](https://github.com/sveltejs/svelte/pull/10980))

- fix: child effects are removed from parent branches ([#10985](https://github.com/sveltejs/svelte/pull/10985))

## 5.0.0-next.88

### Patch Changes

- fix: further improvements to effect scheduling and flushing ([#10971](https://github.com/sveltejs/svelte/pull/10971))

- feat: re-export built-ins from `svelte/reactivity` on the server ([#10973](https://github.com/sveltejs/svelte/pull/10973))

## 5.0.0-next.87

### Patch Changes

- fix: apply animate on prefix/suffix each block mutations ([#10965](https://github.com/sveltejs/svelte/pull/10965))

## 5.0.0-next.86

### Patch Changes

- fix: improved effect sequencing and execution order ([#10949](https://github.com/sveltejs/svelte/pull/10949))

- breaking: onDestroy functions run child-first ([#10949](https://github.com/sveltejs/svelte/pull/10949))

- fix: improve action support for nested $effect ([#10962](https://github.com/sveltejs/svelte/pull/10962))

## 5.0.0-next.85

### Patch Changes

- feat: use implicit return for each block keys ([#10938](https://github.com/sveltejs/svelte/pull/10938))

- breaking: always run pre effects immediately ([#10928](https://github.com/sveltejs/svelte/pull/10928))

- fix: improve order of pre-effect execution ([#10942](https://github.com/sveltejs/svelte/pull/10942))

- feat: more efficient each block compiler output ([#10937](https://github.com/sveltejs/svelte/pull/10937))

## 5.0.0-next.84

### Patch Changes

- fix: reliably remove undefined attributes during hydration ([#10917](https://github.com/sveltejs/svelte/pull/10917))

- fix: Add `elementtiming` HTMLAttribute, remove `crossorigin` from HTMLInputAttributes ([#10921](https://github.com/sveltejs/svelte/pull/10921))

- feat: shorter compiler output for attribute updates ([#10917](https://github.com/sveltejs/svelte/pull/10917))

## 5.0.0-next.83

### Patch Changes

- feat: more efficient if block compiler output ([#10906](https://github.com/sveltejs/svelte/pull/10906))

- fix: update type of `options.target` ([#10892](https://github.com/sveltejs/svelte/pull/10892))

- fix: correctly hydrate controlled each-else block ([#10887](https://github.com/sveltejs/svelte/pull/10887))

- fix: Add `dirname` to HTMLInputAttributes ([#10908](https://github.com/sveltejs/svelte/pull/10908))

## 5.0.0-next.82

### Patch Changes

- fix: allow runes for variable declarations in the template ([#10879](https://github.com/sveltejs/svelte/pull/10879))

- feat: take form resets into account for two way bindings ([#10617](https://github.com/sveltejs/svelte/pull/10617))

- fix: handle multiple snippet parameters with one or more being optional ([#10833](https://github.com/sveltejs/svelte/pull/10833))

- breaking: apply fallback value every time in runes mode ([#10797](https://github.com/sveltejs/svelte/pull/10797))

## 5.0.0-next.81

### Patch Changes

- feat: add support for webkitdirectory DOM boolean attribute ([#10847](https://github.com/sveltejs/svelte/pull/10847))

- fix: don't override instance methods during legacy class creation ([#10834](https://github.com/sveltejs/svelte/pull/10834))

- fix: adjust scope parent for named slots ([#10843](https://github.com/sveltejs/svelte/pull/10843))

- fix: improve handling of unowned derived signals ([#10842](https://github.com/sveltejs/svelte/pull/10842))

- fix: improve element class attribute behaviour ([#10856](https://github.com/sveltejs/svelte/pull/10856))

- fix: ensure select value is updated upon select option removal ([#10846](https://github.com/sveltejs/svelte/pull/10846))

- fix: ensure capture events don't call delegated events ([#10831](https://github.com/sveltejs/svelte/pull/10831))

## 5.0.0-next.80

### Patch Changes

- fix: add types for svelte/reactivity ([#10817](https://github.com/sveltejs/svelte/pull/10817))

- fix: ensure arguments are supported on all reactive Date methods ([#10813](https://github.com/sveltejs/svelte/pull/10813))

## 5.0.0-next.79

### Patch Changes

- feat: add reactive Map class to svelte/reactivity ([#10803](https://github.com/sveltejs/svelte/pull/10803))

## 5.0.0-next.78

### Patch Changes

- fix: invalidate store when mutated inside each block ([#10785](https://github.com/sveltejs/svelte/pull/10785))

- fix: make `set.has(...)` granular for existing properties' ([#10793](https://github.com/sveltejs/svelte/pull/10793))

## 5.0.0-next.77

### Patch Changes

- fix: adjust render effect ordering ([#10783](https://github.com/sveltejs/svelte/pull/10783))

- fix: handle component binding mutation ([#10786](https://github.com/sveltejs/svelte/pull/10786))

## 5.0.0-next.76

### Patch Changes

- feat: add reactive Set class to svelte/reactivity ([#10781](https://github.com/sveltejs/svelte/pull/10781))

- breaking: make `$props()` rune non-generic ([#10694](https://github.com/sveltejs/svelte/pull/10694))

- fix: improve internal render effect sequencing ([#10769](https://github.com/sveltejs/svelte/pull/10769))

## 5.0.0-next.75

### Patch Changes

- fix: use getters for derived class state fields, with memoisation ([#10757](https://github.com/sveltejs/svelte/pull/10757))

## 5.0.0-next.74

### Patch Changes

- fix: prevent reactive statement reruns when they have indirect cyclic dependencies ([#10736](https://github.com/sveltejs/svelte/pull/10736))

## 5.0.0-next.73

### Patch Changes

- fix: improve bind:this support around proxyied state ([#10732](https://github.com/sveltejs/svelte/pull/10732))

- fix: bump specificity on all members of a selector list ([#10730](https://github.com/sveltejs/svelte/pull/10730))

- breaking: preserve slots inside templates with a shadowrootmode attribute ([#10721](https://github.com/sveltejs/svelte/pull/10721))

- chore: custom elements validation ([#10720](https://github.com/sveltejs/svelte/pull/10720))

- fix: ensure performance.now() and requestAnimationFrame() are polyfilled in ssr ([#10715](https://github.com/sveltejs/svelte/pull/10715))

- fix: eagerly unsubscribe when store is changed ([#10727](https://github.com/sveltejs/svelte/pull/10727))

- fix: error when exporting reassigned state from module context ([#10728](https://github.com/sveltejs/svelte/pull/10728))

## 5.0.0-next.72

### Patch Changes

- fix: adjust keyed each block equality handling ([#10699](https://github.com/sveltejs/svelte/pull/10699))

- fix: improve indexed each equality ([#10702](https://github.com/sveltejs/svelte/pull/10702))

- fix: prevent snippet children conflict ([#10700](https://github.com/sveltejs/svelte/pull/10700))

## 5.0.0-next.71

### Patch Changes

- fix: improve namespace inference when having `{@render}` and `{@html}` tags ([#10631](https://github.com/sveltejs/svelte/pull/10631))

- fix: don't collapse whitespace within text nodes ([#10691](https://github.com/sveltejs/svelte/pull/10691))

## 5.0.0-next.70

### Patch Changes

- fix: better ownership mutation validation ([#10673](https://github.com/sveltejs/svelte/pull/10673))

- fix: handle TypeScript's optional parameter syntax in snippets ([#10671](https://github.com/sveltejs/svelte/pull/10671))

- fix: deduplicate generated props and action arg names ([#10669](https://github.com/sveltejs/svelte/pull/10669))

## 5.0.0-next.69

### Patch Changes

- perf: bail early when traversing non-state ([#10654](https://github.com/sveltejs/svelte/pull/10654))

- feat: improve ssr html mismatch validation ([#10658](https://github.com/sveltejs/svelte/pull/10658))

- fix: improve ssr output of dynamic textarea elements ([#10638](https://github.com/sveltejs/svelte/pull/10638))

- fix: improve ssr code generation for class property $derived ([#10661](https://github.com/sveltejs/svelte/pull/10661))

- fix: warn when `$props` rune not called ([#10655](https://github.com/sveltejs/svelte/pull/10655))

- fix: improve derived rune destructuring support ([#10665](https://github.com/sveltejs/svelte/pull/10665))

- feat: allow arbitrary call expressions and optional chaining for snippets ([#10656](https://github.com/sveltejs/svelte/pull/10656))

- fix: add `$set` and `$on` methods in legacy compat mode ([#10642](https://github.com/sveltejs/svelte/pull/10642))

## 5.0.0-next.68

### Patch Changes

- fix: improve deep_read performance ([#10624](https://github.com/sveltejs/svelte/pull/10624))

## 5.0.0-next.67

### Patch Changes

- fix: improve event delegation with shadowed bindings ([#10620](https://github.com/sveltejs/svelte/pull/10620))

- feat: add reactive Date object to svelte/reactivity ([#10622](https://github.com/sveltejs/svelte/pull/10622))

## 5.0.0-next.66

### Patch Changes

- fix: don't clear date input on temporarily invalid value ([#10616](https://github.com/sveltejs/svelte/pull/10616))

- fix: use safe-equals comparison for `@const` tags in legacy mode ([#10606](https://github.com/sveltejs/svelte/pull/10606))

- fix: improve proxy effect dependency tracking ([#10605](https://github.com/sveltejs/svelte/pull/10605))

- fix: prevent window listeners from triggering events twice ([#10611](https://github.com/sveltejs/svelte/pull/10611))

- feat: allow dynamic `type` attribute with `bind:value` ([#10608](https://github.com/sveltejs/svelte/pull/10608))

- fix: make `bind_this` implementation more robust ([#10598](https://github.com/sveltejs/svelte/pull/10598))

- fix: tweak initial `bind:clientWidth/clientHeight/offsetWidth/offsetHeight` update timing ([#10512](https://github.com/sveltejs/svelte/pull/10512))

- fix: correctly handle proxied signal writes before reads ([#10612](https://github.com/sveltejs/svelte/pull/10612))

## 5.0.0-next.65

### Patch Changes

- fix: improve $inspect handling of derived objects ([#10584](https://github.com/sveltejs/svelte/pull/10584))

- fix: permit whitespace within template scripts ([#10591](https://github.com/sveltejs/svelte/pull/10591))

- fix: allow boolean `contenteditable` attribute ([#10590](https://github.com/sveltejs/svelte/pull/10590))

- fix: improve import event handler support ([#10592](https://github.com/sveltejs/svelte/pull/10592))

## 5.0.0-next.64

### Patch Changes

- fix: inherit ownerlessness when creating child proxies ([#10577](https://github.com/sveltejs/svelte/pull/10577))

## 5.0.0-next.63

### Patch Changes

- fix: handle member expressions in directives ([#10576](https://github.com/sveltejs/svelte/pull/10576))

- fix: remove memory leak ([#10570](https://github.com/sveltejs/svelte/pull/10570))

- fix: call beforeUpdate/afterUpdate callbacks when props are mutated ([#10570](https://github.com/sveltejs/svelte/pull/10570))

- fix: improve props spreading logic ([#10574](https://github.com/sveltejs/svelte/pull/10574))

## 5.0.0-next.62

### Patch Changes

- feat: allow state/derived/props to be explicitly exported from components ([#10523](https://github.com/sveltejs/svelte/pull/10523))

- fix: replace proxy-based readonly validation with stack-trace-based ownership tracking ([#10464](https://github.com/sveltejs/svelte/pull/10464))

- fix: correct context applied to batch_inspect ([#10569](https://github.com/sveltejs/svelte/pull/10569))

## 5.0.0-next.61

### Patch Changes

- fix: improve each block item equality for immutable mode ([#10537](https://github.com/sveltejs/svelte/pull/10537))

- fix: improve handling of unowned derived signals ([#10565](https://github.com/sveltejs/svelte/pull/10565))

- fix: better handling of empty text node hydration ([#10545](https://github.com/sveltejs/svelte/pull/10545))

- fix: ensure update methods of actions and reactive statements work with fine-grained `$state` ([#10543](https://github.com/sveltejs/svelte/pull/10543))

- fix: don't execute scripts inside `@html` when instantiated on the client ([#10556](https://github.com/sveltejs/svelte/pull/10556))

- fix: only escape characters in SSR template ([#10555](https://github.com/sveltejs/svelte/pull/10555))

- fix: wire up `events` in `mount` correctly and fix its types ([#10553](https://github.com/sveltejs/svelte/pull/10553))

- fix: better handling of derived signals that have no dependencies ([#10558](https://github.com/sveltejs/svelte/pull/10558))

- fix: improve state store mutation compiler output ([#10561](https://github.com/sveltejs/svelte/pull/10561))

## 5.0.0-next.60

### Patch Changes

- fix: improve effect over-fire on store subscription init ([#10535](https://github.com/sveltejs/svelte/pull/10535))

- fix: use init properties when exporting non-state values in prod ([#10521](https://github.com/sveltejs/svelte/pull/10521))

## 5.0.0-next.59

### Patch Changes

- chore: improve code generation for `bind:this` in SSR mode ([#10524](https://github.com/sveltejs/svelte/pull/10524))

- fix: visit expression node in directives ([#10527](https://github.com/sveltejs/svelte/pull/10527))

## 5.0.0-next.58

### Patch Changes

- breaking: remove `createRoot`, adjust `mount`/`hydrate` APIs, introduce `unmount` ([#10516](https://github.com/sveltejs/svelte/pull/10516))

## 5.0.0-next.57

### Patch Changes

- fix: correctly scope CSS selectors with descendant combinators ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- feat: implement support for `:is(...)` and `:where(...)` ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- chore: treeshake unused store subscriptions in SSR mode ([#10506](https://github.com/sveltejs/svelte/pull/10506))

- fix: warn against accidental global event referenced ([#10442](https://github.com/sveltejs/svelte/pull/10442))

- fix: improve bind:this support for each blocks ([#10510](https://github.com/sveltejs/svelte/pull/10510))

- feat: implement nested CSS support ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- breaking: encapsulate/remove selectors inside `:is(...)` and `:where(...)` ([#10490](https://github.com/sveltejs/svelte/pull/10490))

## 5.0.0-next.56

### Patch Changes

- feat: add hydrate method, make hydration treeshakeable ([#10497](https://github.com/sveltejs/svelte/pull/10497))

- fix: makes keyed each blocks consistent between dev and prod ([#10500](https://github.com/sveltejs/svelte/pull/10500))

- fix: subscribe to stores in `transition`,`animation`,`use` directives ([#10481](https://github.com/sveltejs/svelte/pull/10481))

## 5.0.0-next.55

### Patch Changes

- feat: derive destructured derived objects values ([#10488](https://github.com/sveltejs/svelte/pull/10488))

- fix: prevent infinite loop when writing to store using shorthand ([#10477](https://github.com/sveltejs/svelte/pull/10477))

- fix: add proper source map support ([#10459](https://github.com/sveltejs/svelte/pull/10459))

## 5.0.0-next.54

### Patch Changes

- breaking: replace `$derived.call` with `$derived.by` ([#10445](https://github.com/sveltejs/svelte/pull/10445))

- fix: improve global transition outro handling ([#10474](https://github.com/sveltejs/svelte/pull/10474))

## 5.0.0-next.53

### Patch Changes

- fix: only throw bind error when not passing a value ([#10090](https://github.com/sveltejs/svelte/pull/10090))

- fix: improve global transition handling of effect cleardown ([#10469](https://github.com/sveltejs/svelte/pull/10469))

- fix: improve handling of object property deletions ([#10456](https://github.com/sveltejs/svelte/pull/10456))

- fix: ensure inspect fires on prop changes ([#10468](https://github.com/sveltejs/svelte/pull/10468))

## 5.0.0-next.52

### Patch Changes

- fix: use hybrid scoping strategy for consistent specificity increase ([#10443](https://github.com/sveltejs/svelte/pull/10443))

- fix: throw validation error when binding to each argument in runes mode ([#10441](https://github.com/sveltejs/svelte/pull/10441))

- fix: make CSS animation declaration transformation more robust ([#10432](https://github.com/sveltejs/svelte/pull/10432))

- fix: handle sole empty expression tags ([#10433](https://github.com/sveltejs/svelte/pull/10433))

## 5.0.0-next.51

### Patch Changes

- fix: align `beforeUpdate`/`afterUpdate` behavior better with that in Svelte 4 ([#10408](https://github.com/sveltejs/svelte/pull/10408))

- fix: disallow exporting props, derived and reassigned state from within components ([#10430](https://github.com/sveltejs/svelte/pull/10430))

- fix: improve indexed each array reconcilation ([#10422](https://github.com/sveltejs/svelte/pull/10422))

- fix: add compiler error for each block mutations in runes mode ([#10428](https://github.com/sveltejs/svelte/pull/10428))

## 5.0.0-next.50

### Patch Changes

- fix: set `open` binding value in `<details>` ([#10413](https://github.com/sveltejs/svelte/pull/10413))

## 5.0.0-next.49

### Patch Changes

- fix: properly analyze group expressions ([#10410](https://github.com/sveltejs/svelte/pull/10410))

- fix: handle nested script tags ([#10416](https://github.com/sveltejs/svelte/pull/10416))

- fix: only update lazy properties that have actually changed ([#10415](https://github.com/sveltejs/svelte/pull/10415))

- fix: correctly determine binding scope of `let:` directives ([#10395](https://github.com/sveltejs/svelte/pull/10395))

- fix: run `onDestroy` callbacks during SSR ([#10297](https://github.com/sveltejs/svelte/pull/10297))

## 5.0.0-next.48

### Patch Changes

- chore: bump zimmerframe to fix bugs introduced in previous version ([#10405](https://github.com/sveltejs/svelte/pull/10405))

## 5.0.0-next.47

### Patch Changes

- chore: bump zimmerframe to resolve AST-traversal-related bugs ([`b63ab91c7b92ecec6e7e939d6d509fc3008cf048`](https://github.com/sveltejs/svelte/commit/b63ab91c7b92ecec6e7e939d6d509fc3008cf048))

## 5.0.0-next.46

### Patch Changes

- fix: allow `let:` directives on slot elements ([#10391](https://github.com/sveltejs/svelte/pull/10391))

- fix: repair each block length mismatches during hydration ([#10398](https://github.com/sveltejs/svelte/pull/10398))

## 5.0.0-next.45

### Patch Changes

- fix: correctly determine `bind:group` members ([#10368](https://github.com/sveltejs/svelte/pull/10368))

- fix: make inline doc links valid ([#10365](https://github.com/sveltejs/svelte/pull/10365))

## 5.0.0-next.44

### Patch Changes

- fix: bindings with typescript assertions ([#10329](https://github.com/sveltejs/svelte/pull/10329))

- fix: only reuse state proxies that belong to the current value ([#10343](https://github.com/sveltejs/svelte/pull/10343))

## 5.0.0-next.43

### Patch Changes

- fix: insert empty text nodes while hydrating, if necessary ([#9729](https://github.com/sveltejs/svelte/pull/9729))

- fix: correctly update tweened store initialized with nullish value ([#10356](https://github.com/sveltejs/svelte/pull/10356))

## 5.0.0-next.42

### Patch Changes

- breaking: snippets can now take multiple arguments, support default parameters. Because of this, the type signature has changed ([#9988](https://github.com/sveltejs/svelte/pull/9988))

- Use generic `T` as the return type for `$derived.call()` ([#10349](https://github.com/sveltejs/svelte/pull/10349))

- fix: replace TODO errors ([#10326](https://github.com/sveltejs/svelte/pull/10326))

- fix: add proper typings for `$derived.call` ([`6145be5c695a063c70944272a42d9c63fdd71d64`](https://github.com/sveltejs/svelte/commit/6145be5c695a063c70944272a42d9c63fdd71d64))

- fix: improve handling of unowned derived signals ([#10342](https://github.com/sveltejs/svelte/pull/10342))

- fix: correctly reference destructured derived binding in event handler ([#10333](https://github.com/sveltejs/svelte/pull/10333))

- fix: add `scrollend` event type ([#10337](https://github.com/sveltejs/svelte/pull/10337))

- fix: improve unstate handling of non enumerable properties ([#10348](https://github.com/sveltejs/svelte/pull/10348))

## 5.0.0-next.41

### Patch Changes

- fix: handle event delegation correctly when having sibling event listeners ([#10307](https://github.com/sveltejs/svelte/pull/10307))

- chore: add $derived.call rune ([#10240](https://github.com/sveltejs/svelte/pull/10240))

## 5.0.0-next.40

### Patch Changes

- chore: cleanup derived destruction ([#10303](https://github.com/sveltejs/svelte/pull/10303))

- fix: correctly parse at-rules containing special characters in strings ([#10221](https://github.com/sveltejs/svelte/pull/10221))

- fix: Add missing `miter-clip` and `arcs` values to `stroke-linejoin` attribute ([#10141](https://github.com/sveltejs/svelte/pull/10141))

## 5.0.0-next.39

### Patch Changes

- fix: handle deep assignments to `$state()` class properties correctly ([#10289](https://github.com/sveltejs/svelte/pull/10289))

- fix: prevent false positive store error in module script ([#10291](https://github.com/sveltejs/svelte/pull/10291))

- fix: allow type selector in `:global()` when it's at a start of a compound selector ([#10287](https://github.com/sveltejs/svelte/pull/10287))

## 5.0.0-next.38

### Patch Changes

- chore: improve should_proxy_or_freeze logic internally ([#10249](https://github.com/sveltejs/svelte/pull/10249))

- fix: add back `derived` type overload ([`776ac3c1762da5f8147c457a997a417cfae67e4c`](https://github.com/sveltejs/svelte/commit/776ac3c1762da5f8147c457a997a417cfae67e4c))

- fix: more robust url equality check at dev time ([`14d7b26897cbfa129847c446b0ecf9557d77ef7c`](https://github.com/sveltejs/svelte/commit/14d7b26897cbfa129847c446b0ecf9557d77ef7c))

- fix: correct increment/decrement code generation ([`2861ad66e054d2b14f382aaada4512e3e5d56db8`](https://github.com/sveltejs/svelte/commit/2861ad66e054d2b14f382aaada4512e3e5d56db8))

- fix: sanitize component event names ([#10235](https://github.com/sveltejs/svelte/pull/10235))

- fix: don't hoist function when already referenced in module scope ([`1538264bd5ed431d3048d54efe9c83c4db7fb42a`](https://github.com/sveltejs/svelte/commit/1538264bd5ed431d3048d54efe9c83c4db7fb42a))

- fix: try-catch deep read during `$inspect` ([#10270](https://github.com/sveltejs/svelte/pull/10270))

- fix: allow ts casts in bindings ([#10181](https://github.com/sveltejs/svelte/pull/10181))

- fix: allow `:global(..)` in compound selectors ([#10266](https://github.com/sveltejs/svelte/pull/10266))

- fix: hydrate controlled each blocks correctly ([#10259](https://github.com/sveltejs/svelte/pull/10259))

- chore: improve $state static reference warning heuristics ([#10275](https://github.com/sveltejs/svelte/pull/10275))

- fix: correctly cleanup unowned derived dependency memory ([#10280](https://github.com/sveltejs/svelte/pull/10280))

- fix: ensure proxy is updated before notifying listeners ([#10267](https://github.com/sveltejs/svelte/pull/10267))

## 5.0.0-next.37

### Patch Changes

- fix: skip certain slot validations for custom elements ([#10207](https://github.com/sveltejs/svelte/pull/10207))

- fix: add compiler error for invalid `<p>` contents ([#10201](https://github.com/sveltejs/svelte/pull/10201))

- fix: correctly apply event.currentTarget ([#10216](https://github.com/sveltejs/svelte/pull/10216))

- fix: ensure derived signals properly capture consumers ([#10213](https://github.com/sveltejs/svelte/pull/10213))

## 5.0.0-next.36

### Patch Changes

- fix: transform textarea and contenteditable binding expressions ([#10187](https://github.com/sveltejs/svelte/pull/10187))

- fix: improve transition outro easing ([#10190](https://github.com/sveltejs/svelte/pull/10190))

- fix: ensure unstate() only deeply applies to plain objects and arrays ([#10191](https://github.com/sveltejs/svelte/pull/10191))

- fix: improve invalid nested interactive element error ([#10199](https://github.com/sveltejs/svelte/pull/10199))

- fix: react to mutated slot props in legacy mode ([#10197](https://github.com/sveltejs/svelte/pull/10197))

## 5.0.0-next.35

### Patch Changes

- fix: improve nested effect heuristics ([#10171](https://github.com/sveltejs/svelte/pull/10171))

- fix: simplify event delegation logic, only delegate event attributes ([#10169](https://github.com/sveltejs/svelte/pull/10169))

- fix: prevent transition action overfiring ([#10163](https://github.com/sveltejs/svelte/pull/10163))

- fix: improve event handling compatibility with delegation ([#10168](https://github.com/sveltejs/svelte/pull/10168))

- fix: ensure topological order for render effects ([#10175](https://github.com/sveltejs/svelte/pull/10175))

## 5.0.0-next.34

### Patch Changes

- fix: make `@types/estree` a dependency ([#10150](https://github.com/sveltejs/svelte/pull/10150))

- fix: improve intro transitions on dynamic mount ([#10162](https://github.com/sveltejs/svelte/pull/10162))

- fix: improve code generation ([#10156](https://github.com/sveltejs/svelte/pull/10156))

- fix: adjust `$inspect.with` type ([`c7cb90c91`](https://github.com/sveltejs/svelte/commit/c7cb90c91cd3553ad59126267c9bfddecbb290b4))

- fix: improve how transitions are handled on mount ([#10157](https://github.com/sveltejs/svelte/pull/10157))

- fix: adjust `parse` return type ([`a271878ab`](https://github.com/sveltejs/svelte/commit/a271878abe7018923839401129b18082eb2c811a))

## 5.0.0-next.33

### Patch Changes

- fix: improve ssr template code generation ([#10151](https://github.com/sveltejs/svelte/pull/10151))

- fix: improve template literal expression output generation ([#10147](https://github.com/sveltejs/svelte/pull/10147))

## 5.0.0-next.32

### Patch Changes

- fix: improve outro behavior with transitions ([#10139](https://github.com/sveltejs/svelte/pull/10139))

- chore: remove internal functions from `svelte/transition` exports ([#10132](https://github.com/sveltejs/svelte/pull/10132))

- fix: further animation transition improvements ([#10138](https://github.com/sveltejs/svelte/pull/10138))

- fix: improve animation transition heuristics ([#10119](https://github.com/sveltejs/svelte/pull/10119))

## 5.0.0-next.31

### Patch Changes

- fix: infer `svg` namespace correctly ([#10027](https://github.com/sveltejs/svelte/pull/10027))

- fix: keep intermediate number value representations ([`d171a39b0`](https://github.com/sveltejs/svelte/commit/d171a39b0ad97e2a05de1f38bc76a3d345e2b3d5))

- feat: allow modifiying derived props ([#10080](https://github.com/sveltejs/svelte/pull/10080))

- fix: improve signal consumer tracking behavior ([#10121](https://github.com/sveltejs/svelte/pull/10121))

- fix: support async/await in destructuring assignments ([#9962](https://github.com/sveltejs/svelte/pull/9962))

- fix: take into account member expressions when determining legacy reactive dependencies ([#10128](https://github.com/sveltejs/svelte/pull/10128))

- fix: make `ComponentType` generic optional ([`14dbc1be1`](https://github.com/sveltejs/svelte/commit/14dbc1be1720ff69e6f3c407e43c9c0765b0c140))

- fix: silence false positive state warning ([`dda4ad510`](https://github.com/sveltejs/svelte/commit/dda4ad510f1907a114a16227c3412eb00bd21738))

- fix: ensure nested blocks are inert during outro transitions ([#10126](https://github.com/sveltejs/svelte/pull/10126))

- fix: improve ssr template literal generation ([#10127](https://github.com/sveltejs/svelte/pull/10127))

## 5.0.0-next.30

### Patch Changes

- fix: allow transition undefined payload ([#10117](https://github.com/sveltejs/svelte/pull/10117))

- fix: apply key animations on proxied arrays ([#10113](https://github.com/sveltejs/svelte/pull/10113))

- fix: improve internal signal dependency checking logic ([#10111](https://github.com/sveltejs/svelte/pull/10111))

- fix: correctly call exported state ([#10114](https://github.com/sveltejs/svelte/pull/10114))

- fix: take into account setters when spreading and binding ([#10091](https://github.com/sveltejs/svelte/pull/10091))

- fix: transform `{@render ...}` expression ([#10116](https://github.com/sveltejs/svelte/pull/10116))

## 5.0.0-next.29

### Patch Changes

- fix: improve text node output ([#10081](https://github.com/sveltejs/svelte/pull/10081))

- fix: improve style parser whitespace handling ([#10077](https://github.com/sveltejs/svelte/pull/10077))

- fix: allow input elements within button elements ([#10083](https://github.com/sveltejs/svelte/pull/10083))

- fix: support TypeScript's `satisfies` operator ([#10068](https://github.com/sveltejs/svelte/pull/10068))

- fix: provide `unstate` in server environment ([`877ff1ee7`](https://github.com/sveltejs/svelte/commit/877ff1ee7d637e2248145d975748e1012a977396))

- fix: improve key block reactivity detection ([#10092](https://github.com/sveltejs/svelte/pull/10092))

- fix: always treat spread attributes as reactive and separate them if needed ([#10071](https://github.com/sveltejs/svelte/pull/10071))

## 5.0.0-next.28

### Patch Changes

- fix: deeply unstate objects passed to inspect ([#10056](https://github.com/sveltejs/svelte/pull/10056))

- fix: handle delegated events of elements moved outside the container ([#10060](https://github.com/sveltejs/svelte/pull/10060))

- fix: improve script `lang` attribute detection ([#10046](https://github.com/sveltejs/svelte/pull/10046))

- fix: improve pseudo class parsing ([#10055](https://github.com/sveltejs/svelte/pull/10055))

- fix: add types for popover attributes and events ([#10041](https://github.com/sveltejs/svelte/pull/10041))

- fix: skip generating $.proxy() calls for unary and binary expressions ([#9979](https://github.com/sveltejs/svelte/pull/9979))

- fix: allow pseudo classes after `:global(..)` ([#10055](https://github.com/sveltejs/svelte/pull/10055))

- fix: bail-out event handler referencing each index ([#10063](https://github.com/sveltejs/svelte/pull/10063))

- fix: parse `:nth-of-type(xn+y)` correctly ([#9970](https://github.com/sveltejs/svelte/pull/9970))

- fix: ensure if block is executed in correct order ([#10053](https://github.com/sveltejs/svelte/pull/10053))

## 5.0.0-next.27

### Patch Changes

- fix: evaluate transition parameters when the transition runs ([#9836](https://github.com/sveltejs/svelte/pull/9836))

- feat: add `$state.frozen` rune ([#9851](https://github.com/sveltejs/svelte/pull/9851))

- fix: correctly transform prop fallback values that use other props ([#9985](https://github.com/sveltejs/svelte/pull/9985))

- fix: escape template literal characters in text sequences ([#9973](https://github.com/sveltejs/svelte/pull/9973))

- fix: inject comment in place of `<noscript>` in client output ([#9953](https://github.com/sveltejs/svelte/pull/9953))

## 5.0.0-next.26

### Patch Changes

- fix: better handle array property deletion reactivity ([#9921](https://github.com/sveltejs/svelte/pull/9921))

- fix: improve event delegation handler hoisting ([#9929](https://github.com/sveltejs/svelte/pull/9929))

## 5.0.0-next.25

### Patch Changes

- fix: improve whitespace handling ([#9912](https://github.com/sveltejs/svelte/pull/9912))

- fix: improve each block fallback handling ([#9914](https://github.com/sveltejs/svelte/pull/9914))

- fix: cleanup each block animations on destroy ([#9917](https://github.com/sveltejs/svelte/pull/9917))

## 5.0.0-next.24

### Patch Changes

- fix: improve props aliasing ([#9900](https://github.com/sveltejs/svelte/pull/9900))

- feat: add support for `{@const}` inside snippet block ([#9904](https://github.com/sveltejs/svelte/pull/9904))

- fix: improve attribute directive reactivity detection ([#9907](https://github.com/sveltejs/svelte/pull/9907))

- fix: improve $inspect batching ([#9902](https://github.com/sveltejs/svelte/pull/9902))

- chore: improve readonly prop messaging ([#9901](https://github.com/sveltejs/svelte/pull/9901))

- fix: better support for top-level snippet declarations ([#9898](https://github.com/sveltejs/svelte/pull/9898))

## 5.0.0-next.23

### Patch Changes

- feat: add `gamepadconnected` and `gamepaddisconnected` events ([#9861](https://github.com/sveltejs/svelte/pull/9861))

- fix: improve unstate type definition ([#9895](https://github.com/sveltejs/svelte/pull/9895))

- fix: correctly reflect readonly proxy marker ([#9893](https://github.com/sveltejs/svelte/pull/9893))

- chore: improve each block fast-path heuristic ([#9855](https://github.com/sveltejs/svelte/pull/9855))

- fix: improve html tag svg behaviour ([#9894](https://github.com/sveltejs/svelte/pull/9894))

- fix: ensure class constructor values are proxied ([#9888](https://github.com/sveltejs/svelte/pull/9888))

- fix: improve each block index handling ([#9889](https://github.com/sveltejs/svelte/pull/9889))

## 5.0.0-next.22

### Patch Changes

- fix: handle event hoisting props referencing ([#9846](https://github.com/sveltejs/svelte/pull/9846))

- fix: support dynamic transition functions ([#9844](https://github.com/sveltejs/svelte/pull/9844))

- fix: ensure action function returns object ([#9848](https://github.com/sveltejs/svelte/pull/9848))

## 5.0.0-next.21

### Patch Changes

- chore: refactor props handling ([#9826](https://github.com/sveltejs/svelte/pull/9826))

- fix: improve each key animations ([#9842](https://github.com/sveltejs/svelte/pull/9842))

- chore: avoid creating thunk for call expressions when appropriate ([#9841](https://github.com/sveltejs/svelte/pull/9841))

- fix: improve signal consumer removal logic ([#9837](https://github.com/sveltejs/svelte/pull/9837))

- fix: ensure computed props are wrapped in derived ([#9835](https://github.com/sveltejs/svelte/pull/9835))

- fix: better handle unowned derived signals ([#9832](https://github.com/sveltejs/svelte/pull/9832))

- fix: improve each block with animate ([#9839](https://github.com/sveltejs/svelte/pull/9839))

- breaking: change `$inspect` API ([#9838](https://github.com/sveltejs/svelte/pull/9838))

## 5.0.0-next.20

### Patch Changes

- fix: better readonly checks for proxies ([#9808](https://github.com/sveltejs/svelte/pull/9808))

- fix: prevent infinite loops stemming from invalidation method ([#9811](https://github.com/sveltejs/svelte/pull/9811))

- fix: improve non state referenced warning ([#9809](https://github.com/sveltejs/svelte/pull/9809))

- fix: reuse existing proxy when object has multiple references ([#9821](https://github.com/sveltejs/svelte/pull/9821))

- fix: improve consistency issues around binding invalidation ([#9810](https://github.com/sveltejs/svelte/pull/9810))

- fix: tweak css nth regex ([#9806](https://github.com/sveltejs/svelte/pull/9806))

- fix: adjust children snippet default type ([`dcdd64548`](https://github.com/sveltejs/svelte/commit/dcdd645480ab412eb563632e70801f4d61c1d787))

- fix: correctly apply scope on component children ([#9824](https://github.com/sveltejs/svelte/pull/9824))

## 5.0.0-next.19

### Patch Changes

- feat: add unstate utility function ([#9776](https://github.com/sveltejs/svelte/pull/9776))

- fix: ensure proxied array length is updated ([#9782](https://github.com/sveltejs/svelte/pull/9782))

- chore: fix compiler errors test suite ([#9754](https://github.com/sveltejs/svelte/pull/9754))

- fix: ensure transitions properly cancel on completion ([#9778](https://github.com/sveltejs/svelte/pull/9778))

- feat: make fallback prop values readonly ([#9789](https://github.com/sveltejs/svelte/pull/9789))

- fix: tweak invalid dollar prefix rules around function args ([#9792](https://github.com/sveltejs/svelte/pull/9792))

- fix: ensure generated code does not use keywords as variable names ([#9790](https://github.com/sveltejs/svelte/pull/9790))

- feat: disallow fallback values with bindings in runes mode ([#9784](https://github.com/sveltejs/svelte/pull/9784))

- fix: apply event attribute validation to elements only ([#9772](https://github.com/sveltejs/svelte/pull/9772))

- fix: handle css nth-selector syntax ([#9754](https://github.com/sveltejs/svelte/pull/9754))

- feat: throw descriptive error for using runes globals outside of Svelte-compiled files ([#9773](https://github.com/sveltejs/svelte/pull/9773))

## 5.0.0-next.18

### Patch Changes

- feat: proxied state ([#9739](https://github.com/sveltejs/svelte/pull/9739))

- chore: more validation errors ([#9723](https://github.com/sveltejs/svelte/pull/9723))

- fix: allow duplicate snippet declaration names ([#9759](https://github.com/sveltejs/svelte/pull/9759))

- fix: ensure computed props are cached with derived ([#9757](https://github.com/sveltejs/svelte/pull/9757))

- fix: ensure event handlers containing arguments are not hoisted ([#9758](https://github.com/sveltejs/svelte/pull/9758))

## 5.0.0-next.17

### Patch Changes

- fix: improve `$inspect` type definition ([#9731](https://github.com/sveltejs/svelte/pull/9731))

- fix: correctly inspect derived values ([#9731](https://github.com/sveltejs/svelte/pull/9731))

## 5.0.0-next.16

### Patch Changes

- fix: delegate events on elements with bind-this ([#9696](https://github.com/sveltejs/svelte/pull/9696))

- fix: ensure implicit children snippet renders correctly ([#9706](https://github.com/sveltejs/svelte/pull/9706))

- fix: ensure `$slots` exists in runes mode ([#9718](https://github.com/sveltejs/svelte/pull/9718))

- fix: allow `bind:this` with dynamic type on inputs ([#9713](https://github.com/sveltejs/svelte/pull/9713))

- fix: port over props that were set prior to initialisation ([#9704](https://github.com/sveltejs/svelte/pull/9704))

- feat: $inspect rune ([#9705](https://github.com/sveltejs/svelte/pull/9705))

- fix: keep fallback value after spread update not setting that prop ([#9717](https://github.com/sveltejs/svelte/pull/9717))

- fix: tweak const tag parsing ([#9715](https://github.com/sveltejs/svelte/pull/9715))

- chore: remove redundant hydration code ([#9698](https://github.com/sveltejs/svelte/pull/9698))

- fix: improve template text node serialization ([#9722](https://github.com/sveltejs/svelte/pull/9722))

- fix: improve infinite loop capturing ([#9721](https://github.com/sveltejs/svelte/pull/9721))

## 5.0.0-next.15

### Patch Changes

- fix: add children to element typings ([#9679](https://github.com/sveltejs/svelte/pull/9679))

- fix: handle ts expressions when dealing with runes ([#9681](https://github.com/sveltejs/svelte/pull/9681))

## 5.0.0-next.14

### Patch Changes

- feat: warn on references to mutated non-state in template ([#9669](https://github.com/sveltejs/svelte/pull/9669))

- fix: prevent reactive snippet from reinitializing unnecessarily ([#9665](https://github.com/sveltejs/svelte/pull/9665))

- fix: take event attributes into account when checking a11y ([#9664](https://github.com/sveltejs/svelte/pull/9664))

- feat: add $effect.root rune ([#9638](https://github.com/sveltejs/svelte/pull/9638))

- feat: support type definition in {@const} ([#9609](https://github.com/sveltejs/svelte/pull/9609))

- feat: ignore `src`, `srcset`, and `href` attributes when hydrating ([#9662](https://github.com/sveltejs/svelte/pull/9662))

- chore: bump esrap ([#9649](https://github.com/sveltejs/svelte/pull/9649))

- chore: improve `<svelte:element>` generated code ([#9648](https://github.com/sveltejs/svelte/pull/9648))

- chore: prevent some unused variable creation ([#9571](https://github.com/sveltejs/svelte/pull/9571))

## 5.0.0-next.13

### Patch Changes

- fix: apply keyed validation only for keyed each ([#9641](https://github.com/sveltejs/svelte/pull/9641))

- fix: omit this bind this arg if we know it's not a signal ([#9635](https://github.com/sveltejs/svelte/pull/9635))

- fix: improve each block index handling ([#9644](https://github.com/sveltejs/svelte/pull/9644))

## 5.0.0-next.12

### Patch Changes

- fix: adjust mount and createRoot types ([`63e583184`](https://github.com/sveltejs/svelte/commit/63e58318460dbb3485df93d15beb2779a86d2c9a))

- fix: remove constructor overload ([`cb4b1f0a1`](https://github.com/sveltejs/svelte/commit/cb4b1f0a189803bed04adcb90fbd4334782e8469))

- fix: type-level back-compat for default slot and children prop ([`a3bc7d569`](https://github.com/sveltejs/svelte/commit/a3bc7d5698425ec9dde86eb302f2fd56d9da8f96))

## 5.0.0-next.11

### Patch Changes

- feat: add type of `$effect.active` ([#9624](https://github.com/sveltejs/svelte/pull/9624))

- fix: correct bind this multiple bindings ([#9617](https://github.com/sveltejs/svelte/pull/9617))

- chore: reuse common templates ([#9601](https://github.com/sveltejs/svelte/pull/9601))

- fix: handle undefined bubble events ([#9614](https://github.com/sveltejs/svelte/pull/9614))

- fix: dont error on stores looking like runes when runes explicitly turned off ([#9615](https://github.com/sveltejs/svelte/pull/9615))

- fix: improve member expression mutation logic ([#9625](https://github.com/sveltejs/svelte/pull/9625))

- chore: untrack keyed validation logic ([#9618](https://github.com/sveltejs/svelte/pull/9618))

- fix: ensure snippets have correct scope ([#9623](https://github.com/sveltejs/svelte/pull/9623))

- fix: better attribute casing logic ([#9626](https://github.com/sveltejs/svelte/pull/9626))

## 5.0.0-next.10

### Patch Changes

- chore: add inline new class warning ([#9583](https://github.com/sveltejs/svelte/pull/9583))

- fix: prevent false positives when detecting runes mode ([#9599](https://github.com/sveltejs/svelte/pull/9599))

- fix: deconflict generated names against globals ([#9570](https://github.com/sveltejs/svelte/pull/9570))

- chore: bump esrap ([#9590](https://github.com/sveltejs/svelte/pull/9590))

- feat: add $effect.active rune ([#9591](https://github.com/sveltejs/svelte/pull/9591))

- feat: add Snippet type ([#9584](https://github.com/sveltejs/svelte/pull/9584))

- fix: adjust event delegation heuristics ([#9581](https://github.com/sveltejs/svelte/pull/9581))

- chore: remove unused code ([#9593](https://github.com/sveltejs/svelte/pull/9593))

- fix: adjust regex ([#9572](https://github.com/sveltejs/svelte/pull/9572))

## 5.0.0-next.9

### Patch Changes

- chore: more transition code-golfing ([#9536](https://github.com/sveltejs/svelte/pull/9536))

- feat: native TypeScript support ([#9482](https://github.com/sveltejs/svelte/pull/9482))

## 5.0.0-next.8

### Patch Changes

- chore: rename internal object properties ([#9532](https://github.com/sveltejs/svelte/pull/9532))

## 5.0.0-next.7

### Patch Changes

- chore: more signal perf tuning ([#9531](https://github.com/sveltejs/svelte/pull/9531))

- fix: address intro transition bugs ([#9528](https://github.com/sveltejs/svelte/pull/9528))

- chore: tweak signals for better runtime perf ([#9529](https://github.com/sveltejs/svelte/pull/9529))

## 5.0.0-next.6

### Patch Changes

- fix: do not propagate global intro transitions ([#9515](https://github.com/sveltejs/svelte/pull/9515))

## 5.0.0-next.5

### Patch Changes

- fix: tweak script/style tag parsing/preprocessing logic ([#9502](https://github.com/sveltejs/svelte/pull/9502))

- fix: emit useful error on invalid binding to derived state ([#9497](https://github.com/sveltejs/svelte/pull/9497))

- fix: address unowned propagation signal issue ([#9510](https://github.com/sveltejs/svelte/pull/9510))

- fix: add top level snippets to instance scope ([#9467](https://github.com/sveltejs/svelte/pull/9467))

- fix: only treat instance context exports as accessors ([#9500](https://github.com/sveltejs/svelte/pull/9500))

- fix: allow setting files binding for `<input type="file" />` ([#9463](https://github.com/sveltejs/svelte/pull/9463))

- fix: add missing visitor for assignments during compilation ([#9511](https://github.com/sveltejs/svelte/pull/9511))

## 5.0.0-next.4

### Patch Changes

- revert: address bug in before/after update ([#9480](https://github.com/sveltejs/svelte/pull/9480))

## 5.0.0-next.3

### Patch Changes

- chore: use internal `get_descriptors` helper ([#9389](https://github.com/sveltejs/svelte/pull/9389))

- chore: improve bundle code size ([#9476](https://github.com/sveltejs/svelte/pull/9476))

- fix: coerce attribute value to string before comparison ([#9475](https://github.com/sveltejs/svelte/pull/9475))

- fix: handle private fields in `class` in `.svelte.js` files ([#9394](https://github.com/sveltejs/svelte/pull/9394))

- chore: make operations lazy ([#9468](https://github.com/sveltejs/svelte/pull/9468))

- fix: allow svelte:self in snippets ([#9439](https://github.com/sveltejs/svelte/pull/9439))

- fix: check that snippet is not rendered as a component ([#9423](https://github.com/sveltejs/svelte/pull/9423))

- patch: ensure keyed each block fallback to indexed each block ([#9441](https://github.com/sveltejs/svelte/pull/9441))

- fix: allow member access on directives ([#9462](https://github.com/sveltejs/svelte/pull/9462))

- fix: handle dynamic selects with falsy select values ([#9471](https://github.com/sveltejs/svelte/pull/9471))

- fix: ensure dynamic attributes containing call expressions update ([#9443](https://github.com/sveltejs/svelte/pull/9443))

- fix: corrects a beforeUpdate/afterUpdate bug ([#9448](https://github.com/sveltejs/svelte/pull/9448))

- fix: add missing files binding ([#9415](https://github.com/sveltejs/svelte/pull/9415))

- fix: only escape attribute values for elements, not components ([#9456](https://github.com/sveltejs/svelte/pull/9456))

- fix: handle event attribute spreading with event delegation ([#9433](https://github.com/sveltejs/svelte/pull/9433))

- fix: support class exports ([#9465](https://github.com/sveltejs/svelte/pull/9465))

- fix: treat `slot` the same as other props ([#9457](https://github.com/sveltejs/svelte/pull/9457))

## 5.0.0-next.2

### Patch Changes

- breaking: remove selector api ([#9426](https://github.com/sveltejs/svelte/pull/9426))

- fix: correct update_block index type ([#9425](https://github.com/sveltejs/svelte/pull/9425))

- fix: tighten up signals implementation ([#9417](https://github.com/sveltejs/svelte/pull/9417))

- fix: exclude internal props from spread attributes ([#9384](https://github.com/sveltejs/svelte/pull/9384))

- chore: improve keyblock treeshaking ([#9422](https://github.com/sveltejs/svelte/pull/9422))

- breaking: remove Component type, keep using SvelteComponent instead ([#9413](https://github.com/sveltejs/svelte/pull/9413))

- fix: add snippet marker symbol to children prop ([#9395](https://github.com/sveltejs/svelte/pull/9395))

## 5.0.0-next.1

### Patch Changes

- breaking: svelte 5 alpha ([#9381](https://github.com/sveltejs/svelte/pull/9381))
