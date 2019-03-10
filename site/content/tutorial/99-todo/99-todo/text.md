---
title: TODO
---

* write the rest of the tutorial
* add an 'open this in REPL' button that takes you to the full REPL
* figure out wtf to do on mobile

Outline (subject to change):

<style>
	ul {
		padding: 0 !important;
		list-style: none !important;
	}
</style>


## Introduction

* [x] Tags
* [x] Dynamic attributes
* [x] Styling (mention DCE? global styles?)
* [x] Nested components
* [x] HTML tags
* [x] Creating an app — how to import components into JS, etc

Side-quest: create a 'Svelte for new developers' blog post that assumes no knowledge beyond HTML, CSS and JS (i.e. CLI, Node and npm, degit, build tools)

Another one should cover how to set up an editor for syntax highlighting.


## Reactivity

* [x] Assignments
* [x] Declarations
* [x] Statements


## Props

* [x] `export let foo`
* [x] `export let foo = 1`
* [x] spread props
* [ ] `export function foo(){...}`


## Logic

* [x] If blocks
* [x] Else/elseif blocks
* [x] Each blocks
* [x] Keyed each blocks
* [x] Await blocks


## Events

* [x] `on:blah`
* [x] DOM event modifiers
* [x] `createEventDispatcher` and `dispatch`
* [x] shorthand events


## Bindings

* [x] Form bindings (input, textarea, select, multiple select)
* [x] deep/contextual bindings
* [x] Dimensions
* [x] `this`
* [x] shorthand
* [x] component bindings

Maybe lifecycle should go first, since we're using `onMount` in the `this` demo?


## Stores

* [x] `writable` (and second argument?)
* [x] `$foo`
* [x] `readable`
* [x] `derive`
* [ ] custom stores
* [ ] `bind:value={$foo}`
* [ ] `$foo += 1` (if we implement it)
* [ ] Adapting Immer, Redux, Microstates, xstate etc


## Motion

* [x] `tweened`
* [x] `spring`


## Lifecycle

* [x] `onMount`
* [x] `onDestroy`
* [x] `beforeUpdate`
* [x] `afterUpdate`
* [x] `tick`
* [x] how lifecycle functions behave in SSR mode?


## Transitions

* [x] `transition` with built-in transitions
* [x] `in`
* [x] `out`
* [x] Custom CSS transitions
* [x] Custom JS transitions
* [x] Thunk(?) transitions
* [x] `on:introstart` etc
* [ ] Local transitions

## Animations

* [ ] `animate:flip`


## use: directive

* [x] `use:foo`
* [ ] `use:foo={bar}`

## class: directive

* [x] `class:foo={bar}`
* [x] `class:foo`


## Composition

* [x] `<slot>`
* [x] `<slot name="foo">`
* [x] `<slot bar={baz}>` and `let:bar`


## Context

* [x] `setContext` and `getContext`


## Special elements

* [x] `<svelte:self>`
* [x] `<svelte:component>`
* [x] `<svelte:window>`
* [x] `<svelte:body>`
* [x] `<svelte:head>`
* [x] `<svelte:options>`


## Module context

* [x] sharing code
* [x] exports


## Miscellaneous

* [x] Debug tags