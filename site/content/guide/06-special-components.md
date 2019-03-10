---
title: Special elements
---

Svelte includes a handful of built-in elements with special behaviour.


### `<svelte:self>`

Sometimes, a component needs to embed itself recursively — for example if you have a tree-like data structure. In Svelte, that's accomplished with the `<svelte:self>` tag:

```html
<!-- { title: '<svelte:self> tags' } -->
{#if countdown > 0}
	<p>{countdown}</p>
	<svelte:self countdown="{countdown - 1}"/>
{:else}
	<p>liftoff!</p>
{/if}
```

```json
/* { hidden: true } */
{
	countdown: 5
}
```


### `<svelte:component>`

If you don't know what kind of component to render until the app runs — in other words, it's driven by state (aka a dynamic component) — you can use `<svelte:component>`:

```html
<!-- { title: '<svelte:component> tags' } -->
<script>
	import Red from './Red.html';
	import Blue from './Blue.html';

	let foo = true;
</script>

<input type=checkbox bind:checked={foo}> foo
<svelte:component this="{foo ? Red : Blue}" name="thing"/>
```

```html
<!--{ hidden: true, filename: 'Red.html' }-->
<p style="color: red">Red {name}</p>
```

```html
<!--{ hidden: true, filename: 'Blue.html' }-->
<p style="color: blue">Blue {name}</p>
```

The expression inside the `this="{...}"` can be any valid JavaScript expression.


### `<svelte:window>`

The `<svelte:window>` tag gives you a convenient way to declaratively add event listeners to `window`. Event listeners are automatically removed when the component is destroyed.

```html
<!-- { title: '<svelte:window> tags' } -->
<svelte:window on:keydown="{e => (key = event.key, keyCode = e.keyCode)}"/>

<style>
	kbd {
		background-color: #eee;
		border: 2px solid #f4f4f4;
		border-right-color: #ddd;
		border-bottom-color: #ddd;
		font-size: 2em;
		margin: 0 0.5em 0 0;
		padding: 0.5em 0.8em;
		font-family: Inconsolata;
	}
</style>

{#if key}
	<p><kbd>{key === ' ' ? 'Space' : key}</kbd> (code {keyCode})</p>
{:else}
	<p>click in this window and press any key</p>
{/if}
```

You can also bind to certain values — so far `innerWidth`, `outerWidth`, `innerHeight`, `outerHeight`, `scrollX`, `scrollY` and `online`:

```html
<!-- { title: '<svelte:window> bindings' } -->
<svelte:window bind:scrollY={y}/>

<style>
	.background {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 9999px;
		background: linear-gradient(to bottom, #7db9e8 0%,#0a1d33 100%);
	}

	.fixed {
		position: fixed;
		top: 1em;
		left: 1em;
		color: white;
	}
</style>

<div class="background"></div>
<p class="fixed">user has scrolled {y} pixels</p>
```


### `<svelte:body>`

The `<svelte:body>` tag, just like `<svelte:window>`, gives you a convenient way to declaratively add event listeners to the `document.body` object. This is useful for listening to events that don't fire on `window`, such as `mouseenter` and `mouseleave`.


### `<svelte:head>`

If you're building an application with Svelte — particularly if you're using [Sapper](https://sapper.svelte.technology) — then it's likely you'll need to add some content to the `<head>` of your page, such as adding a `<title>` element.

You can do that with the `<svelte:head>` tag:

```html
<!-- { title: '<svelte:head> tags' } -->
<svelte:head>
	<title>{post.title} • My blog</title>
</svelte:head>
```

When [server rendering](docs#server-side-rendering), the `<head>` contents can be extracted separately to the rest of the markup.
