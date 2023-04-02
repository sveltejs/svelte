---
title: The transition directive
---

We can make more appealing user interfaces by gracefully transitioning elements into and out of the DOM. Svelte makes this very easy with the `transition` directive.

First, import the `fade` function from `svelte/transition`...

```svelte
<script>
	import { fade } from 'svelte/transition';
	let visible = true;
</script>
```

...then add it to the `<p>` element:

```svelte
<p transition:fade>Fades in and out</p>
```
