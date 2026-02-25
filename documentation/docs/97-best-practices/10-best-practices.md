---
title: Overview
---

This document is meant to collect a series of best practices to write not only correct but good Svelte code. The content of this page was originally created as a `SKILL.md` file but given it's content it can (and should) be used as a reference by human developers that wish to write the best possible Svelte code.

>[!NOTE] This document will be also synchronized with the [mcp repository](https://github.com/sveltejs/mcp) to serve as a SKILL. To follow the rules of progressive discovery a few paragraph of this page that are only useful in specific situations during svelte development will merely link to other sections of the documentation.

## `$state` and `$derived`

When writing a Svelte component, each variable that needs to be used inside an effect a derived or in the template must be declared with `$state`. Objects and arrays are automatically deeply reactive, and you can just mutate properties or push to them to trigger reactivity. If you are not mutating or pushing, consider using `$state.raw` to improve performance. Not every variable must be stateful, if a variable is only used to store information and never in an `$effect`, `$derived` or in the template you can avoid using `$state` completely.

If one stateful variable depends on another stateful variable, you must use `$derived` to create this new piece of state. `$derived` accepts an expression as input. If you want to use a function, you must use `$derived.by`. Only the stateful variables that are read within a derived actually count as a dependency of that derived. This means that if you guard the read of a stateful variable with an `if`, that stateful variable will only be a dependency when the condition is true. The value of a derived can be overridden; When overridden, the value will change immediately and trigger a DOM update. But when one of the dependencies changes, the value will be recalculated and the DOM updated once again. If a component is receiving a prop and you want a piece of state to be initialised from that prop, usually it's a good idea to use a derived because if that prop is a stateful variable, when it changes, Svelte will just update the value, not remount the component; If the value could be an object, a class, or an array, the suggestion is to use `$state.snapshot` to clone them (`$state.snapshot` is using `structuredClone` under the hood so it might not always be a good idea).

## The `$effect` rune

`$effect` is generally considered a malpractice in Svelte. You should almost never use `$effect` to sync between stateful variables (use a `$derived` for that) and reassigning state within an `$effect` is especially bad. When encountering an `$effect` asks yourself if that's really needed. It can usually be substituted by:

- A `$derived`
- An `@attach`
- A class that uses `createSubscriber`

The valid use cases for `$effect` are mainly to sync Svelte reactivity with a non-reactive system (like a D3 class, `localStorage`, or inside an attachment to do imperative DOM operations).

Like `$derived`, `$effect` automatically has every stateful variable (declared with `$state` or `$derived`) as a dependency when it's read (if you guard the read of a stateful variable with an `if`, that stateful variable will only be a dependency when the condition is true)

If you want to log a value whenever the reactive variable changes use `$inspect` instead.

For more information on when not to use `$effect` read [this document](/docs/svelte/$effect#When-not-to-use-$effect).

`$effect` only runs on the client so you don't need to guard with [`browser`](/docs/kit/$app-environment#browser) or `typeof window === "undefined"`

## `$bindable`

You can use `$bindable` inside `MyComponent.svelte` like this

```svelte
<script>
	let { value = $bindable() } = $props();
</script>
```

to allow `<MyComponent bind:value />`. This can get hairy when the value of the prop is not a literal value; try to use callbacks in that case.

```svelte
<script>
	let { value, onchange } = $props();
</script>
```

## `$inspect.trace`

`$inspect.trace` is a debugging tool for reactivity. If something is not updating properly or running more than it should you can put `$inspect.trace("[yourlabel]")` as the first line of an `$effect` or `$derived.by` to get detailed logs about the dependencies of it.

## Events on elements

Every prop that starts with `on` is treated as an event listener for the element. To register a `click` listener on an element you can do `<button onclick={() => {}} />` 

> [!NOTE] In Svelte 5, `on` is no longer a directive, so you can't use `on:event`, you have to use `onevent`. 

Since elements are just attributes you can spread them, use the `{onclick}` shorthand, etc.

If you need to attach listeners to `window` or `document` use `<svelte:window onclick>` or `<svelte:document onclick>` instead of using `onMount`/`$effect`

## Each blocks

When using an each block to iterate over some value prefer using the item without destructuring it in case you want to bind that value to an attribute. Prefer using a keyed each block if possible, this will improve performance because svelte will just compare the keys to know if it needs to update the dom of that specific element.

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}
```

The key MUST actually uniquely identify the object DO NOT use the index.

## Snippet

You can think of snippets like functions that render markup when invoked with the `{@render}` tag. You can declare snippets in the template part of a Svelte component and they will be available as a variable in the `script` tag. If they don't contain any state created in the `script` tag they will also be available in the `script module`.

Every snippet created as a child of a component will be automatically passed as a prop to that component

```svelte
<MyComponent>
	<!--This will be passed as a `test` prop-->
	{#snippet test()}{/snippet}
</MyComponent>
```

## Attachments

Read [this document](/docs/svelte/@attach) if you need to use imperative DOM api.

## Use dynamic variables in css

If you have a JS variable that you want to use inside CSS you can do so by using the `style:` directive.

```svelte
<div style:--columns={columns}></div>
```

this will add a style attribute with the `--columns:` variable that you can use in your `<style>` tag.

## Dynamic classes

Since `svelte@5.16.0` you can use `clsx` style directly in the `class` attribute of an element

```svelte
<script>
	let { cool } = $props();
</script>

<!-- results in `class="cool"` if `cool` is truthy,
	 `class="lame"` otherwise -->
<div class={{ cool, lame: !cool }}>...</div>

<!-- if `faded` and `large` are both truthy, results in
	 `class="saturate-0 opacity-50 scale-200"` -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

Arrays can contain arrays and objects, and clsx will flatten them.

## Await expressions

If you are using `svelte@5.36` or higher you can read everything about await expressions in [this document](/docs/svelte/await-expressions/llms.txt) to learn how to use `await` in your component and [this file](https://svelte.dev/docs/svelte/hydratable) to learn how to properly hydrate them.

## Styling Child components

Styles are generally scoped in Svelte components and if possible they should remain so...in the rare case where you might want to style a child from the parent there are a few possibilities:

### Use `:global`

`:global` allows you to prevent css pruning in svelte...however using global at the "top level" of a stylesheet will make it truly global. A nice trick to prevent completely global styles is to nest the `global` selector inside a scoped element

```svelte
<div>
	<Component />
</div>

<style>
	div :global(span){
		color: red;
	}
</style>
```

### Use style props

If a component uses CSS variables in his styling you can automatically pass them using a style prop.

```svelte
<Slider
	--track-color="black"
	--thumb-color="rgb({r} {g} {b})"
/>
```

## Stores

In Svelte 4 stores were THE way to allow interactivity outside of a `.svelte` file. In Svelte 5 that changed and you can now use a `.svelte.{ts|js}` file with universal reactivity.

When possible prefer to use universal reactivity instead of creating a store. Some projects might have stores already in use consider that when writing a new utility.

## Context

Context is useful to have some state scoped to a component tree. If you have a situation where you need to have some "global" state consider using context and read [this document](/docs/svelte/context)
