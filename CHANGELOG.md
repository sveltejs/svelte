# Svelte changelog

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

* SSR compiler: Implement `{{{tripes}}}` ([#197](https://github.com/sveltejs/svelte/issues/197))
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
