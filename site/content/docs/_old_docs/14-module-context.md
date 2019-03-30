---
title: Module context
---

So far, our `<script>` tags have been running in the context of a component *instance*. In other words, if you have two components like this...

```html
<!-- { title: 'Counter' } -->
<script>
	import Counter from './Counter.html';
</script>

<Counter/>
<Counter/>
```

```html
<!--{ filename: 'Counter.html' }-->
<script>
	let count = 0;
</script>

<button on:click="{() => count += 1}">+1</button>
```

...each counter has its own `count` variable. The code runs once per instance.

Occasionally, you want code to run once *per module* instead. For that, we use `context="module"`:

```html
<!-- { title: 'Module context' } -->
<script context="module">
	console.log(`this will run once`);
	const answer = 42;
</script>

<script>
	console.log(`this will run once per instance`);
	console.log(`we can 'see' module-level variables like ${answer}`);
</script>
```

> Don't worry about manually hoisting functions from instance context to module context to avoid creating multiple copies of them — Svelte will do that for you


### Module exports

Any named exports from a `context="module"` script become part of the module's static exports. For example, to define a `preload` function for use with [Sapper](https://sapper.svelte.technology):

```html
<!-- { title: 'Module exports', repl: false } -->
<script context="module">
	export async function preload({ params }) {
		const res = await this.fetch(`/blog/${params.slug}.json`);

		return {
			post: await res.json()
		};
	}
</script>
```

```js
import BlogPost, { preload } from './BlogPost.html';
```

You can only have named exports — no `export default` — because the component *is* the default export.