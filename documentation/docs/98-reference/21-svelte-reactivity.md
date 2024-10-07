---
title: svelte/reactivity
---

Svelte provides reactive versions of various built-ins like `SvelteMap`, `SvelteSet` and `SvelteURL`. These can be imported from `svelte/reactivity` and used just like their native counterparts.

```svelte
<script>
	import { SvelteURL } from 'svelte/reactivity';

	const url = new SvelteURL('https://example.com/path');
</script>

<!-- changes to these... -->
<input bind:value={url.protocol} />
<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />

<!-- will update `href` and vice versa -->
<input bind:value={url.href} />
```

> MODULE: svelte/reactivity
