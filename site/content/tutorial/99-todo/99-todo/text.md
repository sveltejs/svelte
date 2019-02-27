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


## Reactivity

* [x] Assignments
* [x] Declarations
* [x] Statements


## Logic

* [x] If blocks
* [ ] Else/elseif blocks
* [ ] Each blocks
* [ ] Keyed each blocks (maybe? kind of need to cover transitions before we can make this obvious)
* [ ] Await blocks


## Props

* [ ] `export let foo`
* [ ] `export let foo = 1`
* [ ] `export function foo(){...}`


## Events

* [ ] `createEventDispatcher` and `dispatch`
* [ ] `on:blah`
* [ ] DOM event modifiers


## Bindings

* [ ] Form bindings (input, textarea, select)
* [ ] Dimensions
* [ ] `this`


## Stores

* [ ] `writable` (and second argument?)
* [ ] `$foo`
* [ ] `readable`
* [ ] `derive`
* [ ] `$foo += 1` (if we implement it)


## Lifecycle

* [ ] `onMount`
* [ ] `onDestroy`
* [ ] `beforeUpdate`
* [ ] `afterUpdate`
* [ ] `tick`
* [ ] how lifecycle functions behave in SSR mode?


## Context

* [ ] `setContext` and `getContext`


## Transitions

* [ ] `transition` with built-in transitions
* [ ] Custom CSS transitions
* [ ] Custom JS transitions
* [ ] `in`
* [ ] `out`

## Animations

* [ ] `animate:flip`


## use: directive

* `use:foo`
* `use:foo={bar}`

## class: directive

* `class:foo={bar}`
* `class:foo`


## Composition

* [ ] `<slot>`
* [ ] `<slot name="foo">`
* [ ] `<slot bar={baz}>` and `let:bar`


## Special elements

* `<svelte:self>`
* `<svelte:component>`
* `<svelte:window>`
* `<svelte:body>`
* `<svelte:head>`


## Miscellaneous

* Keyed each blocks
* Debug tags