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

If you don't know what kind of component to render until the app runs — in other words, it's driven by state — you can use `<svelte:component>`:

```html
<!-- { title: '<svelte:component> tags' } -->
<input type=checkbox bind:checked=foo> foo
<svelte:component this="{foo ? Red : Blue}" name="thing"/>

<script>
	import Red from './Red.html';
	import Blue from './Blue.html';

	export default {
		data() {
			return { Red, Blue }
		}
	};
</script>
```

```html
<!--{ hidden: true, filename: 'Red.html' }-->
<p style="color: red">Red {name}</p>
```

```html
<!--{ hidden: true, filename: 'Blue.html' }-->
<p style="color: blue">Blue {name}</p>
```

> Note that `Red` and `Blue` are items in `data`, *not* `components`, unlike if we were doing `<Red>` or `<Blue>`.

The expression inside the `this="{...}"` can be any valid JavaScript expression. For example, it could be a [computed property](guide#computed-properties):

```html
<!-- { title: '<svelte:component> with computed' } -->
<label><input type=radio bind:group=size value=small> small</label>
<label><input type=radio bind:group=size value=medium> medium</label>
<label><input type=radio bind:group=size value=large> large</label>

<svelte:component this={Size}/>

<script>
	import Small from './Small.html';
	import Medium from './Medium.html';
	import Large from './Large.html';

	export default {
		computed: {
			Size: ({size}) => {
				if (size === 'small') return Small;
				if (size === 'medium') return Medium;
				return Large;
			}
		}
	};
</script>
```

```html
<!--{ filename: 'Small.html' }-->
<p style="font-size: 12px">small</p>
```

```html
<!--{ filename: 'Medium.html' }-->
<p style="font-size: 18px">medium</p>
```

```html
<!--{ filename: 'Large.html' }-->
<p style="font-size: 32px">LARGE</p>
```

```json
/* { hidden: true } */
{
	size: "medium"
}
```


### `<svelte:window>`

The `<svelte:window>` tag gives you a convenient way to declaratively add event listeners to `window`. Event listeners are automatically removed when the component is destroyed.

```html
<!-- { title: '<svelte:window> tags' } -->
<svelte:window on:keydown="set({ key: event.key, keyCode: event.keyCode })"/>

{#if key}
	<p><kbd>{key === ' ' ? 'Space' : key}</kbd> (code {keyCode})</p>
{:else}
	<p>click in this window and press any key</p>
{/if}

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
```

You can also bind to certain values — so far `innerWidth`, `outerWidth`, `innerHeight`, `outerHeight`, `scrollX`, `scrollY` and `online`:

```html
<!-- { title: '<svelte:window> bindings' } -->
<svelte:window bind:scrollY=y/>

<div class="background"></div>
<p class="fixed">user has scrolled {y} pixels</p>

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
```


### `<svelte:head>`

If you're building an application with Svelte — particularly if you're using [Sapper](https://sapper.svelte.technology) — then it's likely you'll need to add some content to the `<head>` of your page, such as adding a `<title>` element.

You can do that with the `<svelte:head>` tag:

```html
<!-- { title: '<svelte:head> tags' } -->
<svelte:head>
	<title>{post.title} • My blog</title>
</svelte:head>
```

When [server rendering](guide#server-side-rendering), the `<head>` contents can be extracted separately to the rest of the markup.