# Svelte changelog

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
