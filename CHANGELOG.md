# Svelte changelog

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
