# svelte

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
