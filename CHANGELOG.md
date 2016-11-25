# Svelte changelog

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
