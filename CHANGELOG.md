# Svelte changelog

## 1.23.0

* Include `ast` in `svelte.compile` return value ([#632](https://github.com/sveltejs/svelte/issues/632))
* Set initial value of `<select>` binding, if unspecified ([#639](https://github.com/sveltejs/svelte/issues/639))
* Mark indirect dependencies of `<select>` bindings (i.e. the dependencies of their `<option>` values) ([#639](https://github.com/sveltejs/svelte/issues/639))

## 1.22.3

* Fix nested component unmounting bug ([#625](https://github.com/sveltejs/svelte/issues/625))
* Allow components to have computed member expression bindings ([#624](https://github.com/sveltejs/svelte/issues/624))
* Handle empty `<style>` tags ([#634](https://github.com/sveltejs/svelte/issues/634))
* Warn on missing component ([#623](https://github.com/sveltejs/svelte/issues/623))
* Allow dynamic `type` attribute for unbound inputs ([#620](https://github.com/sveltejs/svelte/issues/620))
* Rename `addEventListener` and `removeEventListener` directives ([#621](https://github.com/sveltejs/svelte/issues/621))

## 1.22.2

* Escape template strings correctly in SSR output ([#616](https://github.com/sveltejs/svelte/issues/616))
* Prevent magic-string deprecation warning ([#617](https://github.com/sveltejs/svelte/pull/617))

## 1.22.1

* Sanitise event handler names ([#612](https://github.com/sveltejs/svelte/issues/612))

## 1.22.0

* Symmetry between `mount` and `unmount`. This is potentially a breaking change if your components import other components that were precompiled with an earlier version of Svelte ([#592](https://github.com/sveltejs/svelte/issues/592))
* Add `cascade` option, which prevents styles affecting child components if `false`, unless selectors are wrapped in `:global(...)` and keyframe declaration IDs are prefixed with `-global-`. This will become the default behaviour in v2 ([#583](https://github.com/sveltejs/svelte/issues/583))
* Support binding to computed member expressions ([#602](https://github.com/sveltejs/svelte/issues/602))
* Coerce empty string in `number`/`range` inputs to `undefined`, not `0` ([#584](https://github.com/sveltejs/svelte/issues/584))
* Fix insert location of DOM elements in each/if/nested component edge cases ([#610](https://github.com/sveltejs/svelte/issues/610))

## 1.21.0

* Always use `helpers` if referenced, not just for call expressions ([#575](https://github.com/sveltejs/svelte/issues/575))
* Fix parsing of `<textarea>` children ([#599](https://github.com/sveltejs/svelte/pull/599))
* Treat `<textarea>` value attributes and children as equivalent, and fail validation if both are present ([#599](https://github.com/sveltejs/svelte/pull/599))
* Fix `<textarea>` SSR ([#599](https://github.com/sveltejs/svelte/pull/599))
* Apply CSS transition styles immediately if transition has delay ([#574](https://github.com/sveltejs/svelte/issues/574))
* Ensure `transitionManager` is treeshakeable ([#593](https://github.com/sveltejs/svelte/issues/593))
* Fix for environments where `node.style.animation` is undefined ([#587](https://github.com/sveltejs/svelte/issues/587))
* Fix order of operations when dealing with `<select>` elements ([#590](https://github.com/sveltejs/svelte/issues/590))
* Downgrade 'invalid callee' to a warning ([#579](https://github.com/sveltejs/svelte/issues/579))
* Convert to TypeScript ([#573](https://github.com/sveltejs/svelte/pull/573))

## 1.20.2

* Fix destruction of compound if-blocks with outros ([#572](https://github.com/sveltejs/svelte/pull/572))

## 1.20.1

* Fix insertion order of `if` blocks and their anchors ([#569](https://github.com/sveltejs/svelte/issues/569))

## 1.20.0

* Faster, better updates of keyed each blocks ([#373](https://github.com/sveltejs/svelte/issues/373), [#543](https://github.com/sveltejs/svelte/issues/543))
* Use element IDs to robustly track dynamically injected `<style>` tags ([#554](https://github.com/sveltejs/svelte/issues/554))
* Abort outros before corresponding intros ([#546](https://github.com/sveltejs/svelte/issues/546))
* Generate less code for `if` blocks with `else` blocks ([#540](https://github.com/sveltejs/svelte/issues/540))
* Ensure `{{yield}}` block content is injected into the right place ([#561](https://github.com/sveltejs/svelte/issues/561))
* Simpler, more readable codegen code ([#559](https://github.com/sveltejs/svelte/pull/559))
* Validate transition directives ([#564](https://github.com/sveltejs/svelte/issues/564))
* Apply delays to bidirectional transitions ([#562](https://github.com/sveltejs/svelte/issues/562))
* Handle all valid HTML entities ([#565](https://github.com/sveltejs/svelte/pull/565))
* Fix outros on compound `if` blocks ([#565](https://github.com/sveltejs/svelte/pull/565))
* Validation for `<:Window>` tags ([#565](https://github.com/sveltejs/svelte/pull/565))
* Increased test coverage ([#565](https://github.com/sveltejs/svelte/pull/565))

## 1.19.1

* Export `generateKeyframes`, so that CSS transitions work

## 1.19.0

* Experimental support for transitions ([#7](https://github.com/sveltejs/svelte/issues/7))
* Use `querySelector(':checked')` instead of `selectedOptions` ([#539](https://github.com/sveltejs/svelte/issues/539))
* Stringify helpers before bundling them, to avoid renaming errors ([#538](https://github.com/sveltejs/svelte/issues/538))

## 1.18.2

* Parenthesize if-block conditions ([#532](https://github.com/sveltejs/svelte/issues/532))
* Fix parsing of parenthesized expressions ([#534](https://github.com/sveltejs/svelte/issues/534))
* Fix error on `bind:checked` that doesn't belong to a checkbox input ([#529](https://github.com/sveltejs/svelte/pull/529))

## 1.18.1

* Allow `destroy()` in event handlers ([#523](https://github.com/sveltejs/svelte/issues/523))
* Fix bug with `{{yield}}` blocks following elements ([#524](https://github.com/sveltejs/svelte/issues/524))

## 1.18.0

* Visit `<select>` attributes after children, to ensure options are in the right state ([#521](https://github.com/sveltejs/svelte/pull/521))
* Use sibling elements as anchors rather than creating comment nodes wherever possible ([#3](https://github.com/sveltejs/svelte/issues/3))

## 1.17.2

* Replace bad characters when creating variable names based on element names ([#516](https://github.com/sveltejs/svelte/issues/516))

## 1.17.1

* Fixes for static each-else and yield blocks ([#509](https://github.com/sveltejs/svelte/issues/509)), ([#514](https://github.com/sveltejs/svelte/issues/514))
* Code generation tweaks ([#504](https://github.com/sveltejs/svelte/issues/504)), ([#507](https://github.com/sveltejs/svelte/issues/507))

## 1.17.0

* Add `currentTime`, `duration` and `paused` bindings for media elements ([#406](https://github.com/sveltejs/svelte/issues/406))
* Don't treat helpers as dependencies ([#492](https://github.com/sveltejs/svelte/issues/492))
* Allow `<:Window>` event handlers to access component state ([#497](https://github.com/sveltejs/svelte/pull/497))
* Allow two-way binding to properties named 'component' ([#495](https://github.com/sveltejs/svelte/issues/495))
* Group checkbox bindings correctly, to avoid erroneously unchecking siblings ([#498](https://github.com/sveltejs/svelte/issues/498))
* Validate two-way bindings ([#494](https://github.com/sveltejs/svelte/pull/494))
* Allow dynamic each-block to have static else-block ([#501](https://github.com/sveltejs/svelte/pull/501))
* Initialise `<select>` value correctly ([#502](https://github.com/sveltejs/svelte/pull/502))

## 1.16.0

* Better code generation ([#489](https://github.com/sveltejs/svelte/pull/489)), ([#490](https://github.com/sveltejs/svelte/pull/490)), ([#491](https://github.com/sveltejs/svelte/pull/491))
* Prevent binding blowback on initial render ([#488](https://github.com/sveltejs/svelte/pull/488))

## 1.15.1

* Clone data before merging it with state ([#479](https://github.com/sveltejs/svelte/issues/479))
* Apply binding event handlers before user event handlers ([#486](https://github.com/sveltejs/svelte/issues/486))

## 1.15.0

* Dev mode — downgrade 'missing data' to a warning, and ignore whitelisted globals ([#475](https://github.com/sveltejs/svelte/issues/475))
* Fix `<select>` value binding when options are updated late ([#476](https://github.com/sveltejs/svelte/issues/476))
* Throw at compile time if event handler references invalid callee ([#473](https://github.com/sveltejs/svelte/pull/473))
* Check for helper function purity ([#473](https://github.com/sveltejs/svelte/pull/473))
* Validate `namespace` option ([#473](https://github.com/sveltejs/svelte/pull/473))

## 1.14.1

* Replace bad characters when creating variable names based on attributes ([#470](https://github.com/sveltejs/svelte/issues/470))

## 1.14.0

* Better guard against naming conflicts ([#465](https://github.com/sveltejs/svelte/issues/465))
* Better error if getters and setters are used with `methods` ([#425](https://github.com/sveltejs/svelte/issues/425))
* Don't create whitespace nodes inside elements that can't use them ([#189](https://github.com/sveltejs/svelte/issues/189))
* Collapse consecutive `if` statements with the same condition ([#450](https://github.com/sveltejs/svelte/issues/450))
* Window `scroll` bindings are bidirectional ([#404](https://github.com/sveltejs/svelte/issues/404))
* Add `bind:online` to window ([#404](https://github.com/sveltejs/svelte/issues/404))
* In dev mode, throw if read-only properties are set ([#404](https://github.com/sveltejs/svelte/issues/404))
* Prevent conflicts with component name ([#464](https://github.com/sveltejs/svelte/pull/464))
* Ensure event handler names are deconflicted ([#466](https://github.com/sveltejs/svelte/issues/466))

## 1.13.7

* Fix observers — `defer: true` now triggers callback after DOM is updated ([#441](https://github.com/sveltejs/svelte/issues/441))
* Handle empty `computed` property ([#452](https://github.com/sveltejs/svelte/issues/452))
* Correctly bind one-way `<select>` value attributes with objects ([#423](https://github.com/sveltejs/svelte/issues/423))
* Hoist event handlers inside each blocks, where possible ([#456](https://github.com/sveltejs/svelte/pull/456))
* Don't bind event handler callbacks ([#433](https://github.com/sveltejs/svelte/issues/433))
* Internal refactoring and neater code generation ([#453](https://github.com/sveltejs/svelte/pull/453))

## 1.13.6

* Use `assign` helper instead of `Object.assign` for better performance and legacy compatibility ([#431](https://github.com/sveltejs/svelte/issues/431))
* Improved code generation ([#419](https://github.com/sveltejs/svelte/issues/419)), ([#440](https://github.com/sveltejs/svelte/issues/440)), ([#442](https://github.com/sveltejs/svelte/issues/442))

## 1.13.5

* Read `range` and `number` input values as numbers ([#436](https://github.com/sveltejs/svelte/issues/436))
* Better error for `bind:value='{{foo}}'` ([#437](https://github.com/sveltejs/svelte/issues/437))

## 1.13.4

* Prevent unclosed `<script>` tag causing infinite loop ([#435](https://github.com/sveltejs/svelte/pull/435))

## 1.13.3

* Correctly handle `{{true}}`, `{{false}}` and `{{null}}` ([#424](https://github.com/sveltejs/svelte/issues/424))
* Update `<select>` value attributes correctly ([#423](https://github.com/sveltejs/svelte/issues/423))
* Bind custom event handler callbacks ([#428](https://github.com/sveltejs/svelte/issues/428))
* Disallow `import root` ([#430](https://github.com/sveltejs/svelte/pull/430))
* Prevent component bindings mutating the wrong object ([#432](https://github.com/sveltejs/svelte/pull/432))

## 1.13.2

* Fix deep component bindings ([#420](https://github.com/sveltejs/svelte/issues/420))
* Include `css` property in compiler output ([#409](https://github.com/sveltejs/svelte/issues/409))
* Treat functions as mutable objects when recomputing ([#413](https://github.com/sveltejs/svelte/issues/413)
* Include magic-string in bundle ([#410](https://github.com/sveltejs/svelte/issues/410))
* Disable unneeded Bublé transformations for slimmer output ([#411](https://github.com/sveltejs/svelte/pull/411))

## 1.13.1

* Prevent infinite loops with pathological component bindings ([#398](https://github.com/sveltejs/svelte/issues/398))
* More robust deconflicting ([#401](https://github.com/sveltejs/svelte/pull/401))

## 1.13.0

* Add `<:Window>` meta tag with event listeners, and a handful of bindings ([#371](https://github.com/sveltejs/svelte/issues/371))
* Don't uncheck radios incorrectly ([#399](https://github.com/sveltejs/svelte/issues/399))

## 1.12.1

* Deconflict non-helper functions (`addCss` etc) ([#388](https://github.com/sveltejs/svelte/issues/388))
* Allow reserved words in tags, e.g. `{{class}}` ([#383](https://github.com/sveltejs/svelte/issues/383))

## 1.12.0

* Shorthand attributes — `<Widget :foo/>` is equivalent to `<Widget foo='{{foo}}'/>` ([#384](https://github.com/sveltejs/svelte/pull/384))
* Support `bind:group` for radio and checkbox inputs ([#311](https://github.com/sveltejs/svelte/issues/311), [#312](https://github.com/sveltejs/svelte/issues/312))
* Better sourcemap support for two-way bindings

## 1.11.4

* Dev mode warning for bad `component.observe` arguments ([#369](https://github.com/sveltejs/svelte/issues/369))
* Translate `component.on('teardown', ...)` to `component.on('destroy', ...)` and add dev warning ([#365](https://github.com/sveltejs/svelte/issues/365))
* Use shared prototype to save bytes ([#378](https://github.com/sveltejs/svelte/pull/378))

## 1.11.3

* Undo CSS behaviour change in 1.11.2 ([#372](https://github.com/sveltejs/svelte/issues/372))
* Pin version of css-tree ([#370](https://github.com/sveltejs/svelte/pull/370))

## 1.11.2

* Add component CSS to each document a component is rendered to ([#331](https://github.com/sveltejs/svelte/issues/331))

## 1.11.1

* Fix two-way binding for components inside `each` blocks ([#356](https://github.com/sveltejs/svelte/issues/356))

## 1.11.0

* Add `format: 'eval'` and `svelte.create`, to create components directly from source code ([#345](https://github.com/sveltejs/svelte/issues/345))
* Node 4 compatibility ([#109](https://github.com/sveltejs/svelte/issues/109))

## 1.10.3

* Prevent `'</script>'` string occurence breaking pages ([#349](https://github.com/sveltejs/svelte/pull/349))
* Allow reference to whitelisted globals without properties ([#333](https://github.com/sveltejs/svelte/pull/333))
* Don't remove `&nbsp;` incorrectly ([#348](https://github.com/sveltejs/svelte/issues/348))
* `let` -> `var` in `addCss` block ([#351](https://github.com/sveltejs/svelte/pull/351))

## 1.10.2

* Accept any case for doctype declarations ([#336](https://github.com/sveltejs/svelte/issues/336))
* Allow non-top-level `<script>` and `<style>` tags to pass through without processing ([#335](https://github.com/sveltejs/svelte/issues/335))

## 1.10.1

* typecheck argument in _set when in dev mode ([#342](https://github.com/sveltejs/svelte/issues/342))
* Prevent duplicate helpers in non-shared mode ([#337](https://github.com/sveltejs/svelte/issues/337))

## 1.10.0

* Component self-references with `<:Self/>` ([#51](https://github.com/sveltejs/svelte/issues/51))
* Two-way binding with `<select multiple>` ([#313](https://github.com/sveltejs/svelte/issues/313))

## 1.9.1

* Better error for malformed event handlers ([#220](https://github.com/sveltejs/svelte/issues/220))
* Allow function expressions in tags ([#269](https://github.com/sveltejs/svelte/issues/269))

## 1.9.0

* Add development warnings ([#13](https://github.com/sveltejs/svelte/issues/13)), ([#320](https://github.com/sveltejs/svelte/pull/320)), ([#177](https://github.com/sveltejs/svelte/issues/177)), ([#249](https://github.com/sveltejs/svelte/issues/249))
* Better error if parser encounters an unmatched closing tag ([#321](https://github.com/sveltejs/svelte/issues/321))

## 1.8.1

* Allow implicitly closed elements ([#318](https://github.com/sveltejs/svelte/pull/318))
* More informative error messages for unclosed elements/blocks ([#258](https://github.com/sveltejs/svelte/issues/258))
* Deprecate `onrender` and `onteardown` in favour of `oncreate` and `ondestroy` ([#40](https://github.com/sveltejs/svelte/issues/40))

## 1.8.0

* Prevent duplicate imports ([#308](https://github.com/sveltejs/svelte/issues/308))
* Use `input` events (not `change`) for all input elements other than `checkbox` and `radio`, and textareas ([#309](https://github.com/sveltejs/svelte/pull/309))
* Encapsulate keyframe declarations ([#245](https://github.com/sveltejs/svelte/issues/245))

## 1.7.1

* Deconflict imports and shared helpers ([#222](https://github.com/sveltejs/svelte/issues/222))
* Deconflict each-block contexts and reserved words ([#222](https://github.com/sveltejs/svelte/issues/222))
* Allow shorthand properties in expressions ([#296](https://github.com/sveltejs/svelte/issues/296))

## 1.7.0

* Include CSS AST in `svelte.parse` output ([#302](https://github.com/sveltejs/svelte/pull/302))
* Better handling of CSS parse errors ([#302](https://github.com/sveltejs/svelte/pull/302))
* Initialise `<select>` elements with two-way binding correctly ([#301](https://github.com/sveltejs/svelte/issues/301))
* Allow local context in component event handlers inside `each` blocks ([#290](https://github.com/sveltejs/svelte/issues/290))
* Fix two-way binding for components inside `each` blocks ([#290](https://github.com/sveltejs/svelte/issues/290))

## 1.6.11

* Initialise dynamic `<option>` value correctly ([#291](https://github.com/sveltejs/svelte/issues/291))

## 1.6.10

* Ensure `sources` and `sourcesContent` are populated in sourcemaps, even if none of the original code is used ([#295](https://github.com/sveltejs/svelte/pull/295))
* Add `outputFilename` option to populate `file` and `sources` sourcemap properties correctly ([#295](https://github.com/sveltejs/svelte/pull/295))

## 1.6.9

* Don't trigger bindings for torn-down components ([#277](https://github.com/sveltejs/svelte/issues/277))
* SSR: Handle two-way bindings ([#275](https://github.com/sveltejs/svelte/issues/275))
* Improve performance by checking data has changed before updates ([#279](https://github.com/sveltejs/svelte/pull/279))
* Parse CSS with css-tree to prevent transformation errors with unconventional styles ([#288](https://github.com/sveltejs/svelte/issues/288))

## 1.6.8

* Always trigger `onrender`, including when change initiator is a nested component ([#263](https://github.com/sveltejs/svelte/issues/263))
* Handle default function parameters in computations ([#274](https://github.com/sveltejs/svelte/issues/274))

## 1.6.7

* SSR: Fix apostrophes ([#267](https://github.com/sveltejs/svelte/issues/267))
* Add `xmlns` attributes to SVGs ([#262](https://github.com/sveltejs/svelte/pull/262))

## 1.6.6

* Omit text from comment anchors ([#247](https://github.com/sveltejs/svelte/issues/247))
* Handle `xlink` attributes ([#264](https://github.com/sveltejs/svelte/issues/264))

## 1.6.5

* Handle `<!doctype>` declarations ([#255](https://github.com/sveltejs/svelte/pull/255))

## 1.6.4

* Fix updates of yields inside each blocks ([20e1b05](https://github.com/sveltejs/svelte/commit/20e1b05c45dc9fcddfe2e7c5c9fc3109f0d45fa9))
* SSR: Handle attributes with values that begin with a number ([#248](https://github.com/sveltejs/svelte/issues/248))
* Handle multiline comments in CSS ([#252](https://github.com/sveltejs/svelte/issues/252))

## 1.6.3

* Fix `{{yield}}` bugs for components inside `if` and `each` blocks ([#230](https://github.com/sveltejs/svelte/issues/230), [#231](https://github.com/sveltejs/svelte/issues/231))
* Set attributes on `<svg>` elements correctly ([#233](https://github.com/sveltejs/svelte/issues/233))
* Add `svelte.VERSION` property to compiler

## 1.6.2

* Use helpers for `addEventListener`, `removeEventListener`, `setAttribute` ([#227](https://github.com/sveltejs/svelte/pull/227))
* Escape `sharedPath` ([#229](https://github.com/sveltejs/svelte/pull/229))
* Handle attributes with values that begin with a number ([#234](https://github.com/sveltejs/svelte/issues/234))
* Update dependencies

## 1.6.1

* SSR: Handle component directives at arbitrary positions ([#221](https://github.com/sveltejs/svelte/issues/221))
* Provide useful feedback on invalid void closing tag ([#224](https://github.com/sveltejs/svelte/issues/224))

## 1.6.0

* Replace `standalone: false` with `shared: true`, or `shared: 'custom/path/to/shared.js'` ([#218](https://github.com/sveltejs/svelte/issues/218))
* Include `shared.js` in package

## 1.5.0

* Implement `standalone: false` ([#9](https://github.com/sveltejs/svelte/issues/9))
* SSR: Handle component directives ([216](https://github.com/sveltejs/svelte/issues/216))

## 1.4.0

* Keyed `each` blocks ([#81](https://github.com/sveltejs/svelte/issues/81))

## 1.3.1

* Remove file extensions from AMD dependencies ([#144](https://github.com/sveltejs/svelte/issues/144))
* Throw if `options.name` is illegal ([#102](https://github.com/sveltejs/svelte/issues/102))

## 1.3.0

* SSR compiler: Support `format` option ([#196](https://github.com/sveltejs/svelte/issues/196))
* SSR compiler: Don't self-close 'normal' elements ([#200](https://github.com/sveltejs/svelte/issues/200))
* Remove leading spaces from scoped CSS ([#140](https://github.com/sveltejs/svelte/issues/140))
* Internal refactoring

## 1.2.5

* Allow whitelisted globals in templates ([#185](https://github.com/sveltejs/svelte/issues/185))
* Intercept parse errors with `options.onerror`

## 1.2.4

* SSR compiler: Implement `{{{triples}}}` ([#197](https://github.com/sveltejs/svelte/issues/197))
* SSR compiler: Escape HTML in tags ([#197](https://github.com/sveltejs/svelte/issues/197))

## 1.2.3

* Add support for `namespace` declaration for SVG (etc) components ([#147](https://github.com/sveltejs/svelte/issues/147))
* Throw error if methods or lifecycle hooks are arrow functions that use `this` or `arguments` ([#179](https://github.com/sveltejs/svelte/issues/179))
* Use `setAttribute()` for `list` attributes, to preserve link to `<datalist>` ([#178](https://github.com/sveltejs/svelte/issues/178))
* Throw error if default export is not an object literal ([#190](https://github.com/sveltejs/svelte/pull/190))
* Internal refactoring

## 1.2.2

* Omit directives in server-side rendering ([#163](https://github.com/sveltejs/svelte/issues/167))
* Handle comments in SSR ([#165](https://github.com/sveltejs/svelte/issues/165))
* Support calling methods of `event`/`this` in event handlers ([#162](https://github.com/sveltejs/svelte/issues/162))
* Remove `mount` from public API ([#150](https://github.com/sveltejs/svelte/issues/150))

## 1.2.1

* Server-side rendering is available as a compiler option (`generate: 'ssr'`) ([#159](https://github.com/sveltejs/svelte/pull/159))
* Allow call expressions where function is not in `helpers` ([#163](https://github.com/sveltejs/svelte/issues/163))

## 1.2.0

* Server-side rendering of HTML ([#148](https://github.com/sveltejs/svelte/pull/148)) and CSS ([#154](https://github.com/sveltejs/svelte/pull/154))

## 1.1.3

* Handle `xmlns` attributes correctly ([#142](https://github.com/sveltejs/svelte/issues/142))
* Error on duplicate `<style>`/`<script>` tags rather than failing silently ([#142](https://github.com/sveltejs/svelte/issues/142))
* Don't create whitespace text nodes inside SVG elements ([#142](https://github.com/sveltejs/svelte/issues/142))
* Require void elements to be lowercase, to eliminate confusion with components ([#137](https://github.com/sveltejs/svelte/issues/137))

## 1.1.2

* Deconflict variable names ([#88](https://github.com/sveltejs/svelte/issues/88), [#126](https://github.com/sveltejs/svelte/issues/126))

## 1.1.1

* Support multiple SVG elements in a component ([#130](https://github.com/sveltejs/svelte/issues/130))

## 1.1.0

* Separate fragment creation from `mount` ([#91](https://github.com/sveltejs/svelte/pull/91))
* Trigger `onrender` hook at correct time for nested components ([#103](https://github.com/sveltejs/svelte/pull/103))
* Fix keypath dynamic attributes in components ([#46](https://github.com/sveltejs/svelte/issues/46))
* Implement `{{yield}}` ([#112](https://github.com/sveltejs/svelte/pull/112))
* Optimise teardown ([#99](https://github.com/sveltejs/svelte/issues/99))
* Require computed properties to have at least one dependency ([#115](https://github.com/sveltejs/svelte/pull/115))
* Support `{{#each ...}}...{{else}}...{{/each}}` ([#90](https://github.com/sveltejs/svelte/issues/90))
* Triple mustaches ([#35](https://github.com/sveltejs/svelte/issues/35))

## 1.0.7

* Correctly escape HTML entities ([#85](https://github.com/sveltejs/svelte/issues/85))

## 1.0.6

* Generate useful sourcemaps ([#60](https://github.com/sveltejs/svelte/issues/60))

## 1.0.5

* Ensure compiler only generates ES5 code ([#75](https://github.com/sveltejs/svelte/issues/75))
* `get()` without arguments returns entire state object ([#73](https://github.com/sveltejs/svelte/issues/73))

## 1.0.4

* Handle empty attributes in elements and components ([#63](https://github.com/sveltejs/svelte/issues/63))
* Detach top-level text nodes inside departing each blocks ([#62](https://github.com/sveltejs/svelte/issues/62))

## 1.0.3

* Better generated code for `if` blocks, especially with `else`/`elseif` chains ([#28](https://github.com/sveltejs/svelte/pull/28))
* Trim unnecessary whitespace from `else`/`elseif` blocks ([#49](https://github.com/sveltejs/svelte/pull/49))
* Handle trailing comments in script tags ([#64](https://github.com/sveltejs/svelte/issues/64))

## 1.0.2

Set `style.cssText` rather than `style` ([#44](https://github.com/sveltejs/svelte/issues/44))

## 1.0.1

* Preserve SVG namespace inside each blocks
* Always use `setAttribute` with SVG elements

## 1.0.0

* Generate AMD, CJS, IIFE and UMD builds
* Correctly insert text nodes before anchors ([#31](https://github.com/sveltejs/svelte/pull/31))

## 0.3.0

* Fix bug where departing element would unset `ref` incorrectly ([#24](https://github.com/sveltejs/svelte/issues/24))
* Basic template validation ([#6](https://github.com/sveltejs/svelte/issues/6))
* Fire `onrender` hooks once component is in DOM ([#18](https://github.com/sveltejs/svelte/issues/18))
* Only detach nodes when necessary to do so ([#26](https://github.com/sveltejs/svelte/issues/26))

## 0.2.2

* On second thoughts, don't transpile build. Was only really for Uglify's benefit, which is daft

## 0.2.1

* Transpile build

## 0.2.0

* Only generate UMD build, for now
* Include dependencies in the build, treat as `devDependencies`
* Faster initial render
* Parent data overrides child defaults
* Remove top-level text nodes on teardown
* Handle `readUntil` errors in parser
* Basic `<select>` binding
* Handle missing data
* Prevent infinite set/observe loops
* Add `bind:foo` shorthand
* `else` and `elseif` blocks
* Hoist imports

## 0.1.1

* Support unquoted attributes
* Handle entities in attributes
* Inline nested components
* `fire` and `on` methods

## 0.1.0

* Breaking change – Svelte compiler now generates constructor functions rather than factories ([#2](https://github.com/sveltejs/svelte/issues/2))
* SVG support

## 0.0.2

* First release capable of building TodoMVC

## 0.0.1

* Just squatting on the package name
