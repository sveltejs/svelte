---
title: Overview
---

Svelte is a framework for building user interfaces on the web. It uses a compiler to turn declarative components written in HTML, CSS and JavaScript...

```svelte
<!--- file: App.svelte --->
<script>
	function greet() {
		alert('Welcome to Svelte!');
	}
</script>

<button onclick={greet}>click me</button>

<style>
	button {
		font-size: 2em;
	}
</style>
```

...into lean, tightly optimized JavaScript.

You can use it to build anything on the web, from standalone components to ambitious full stack apps (using Svelte's companion application framework, [SvelteKit](../kit)) and everything in between.

These pages serve as reference documentation. If you're new to Svelte, we recommend starting with the [interactive tutorial](/tutorial) and coming back here when you have questions.

You can also try Svelte online in the [playground](/playground) or, if you need a more fully-featured environment, on [StackBlitz](https://sveltekit.new).
