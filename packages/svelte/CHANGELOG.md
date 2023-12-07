# svelte

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

- feat: proxied staet ([#9739](https://github.com/sveltejs/svelte/pull/9739))

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

- fix: port over props that were set prior to initialization ([#9704](https://github.com/sveltejs/svelte/pull/9704))

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
