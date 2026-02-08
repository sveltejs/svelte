---
title: svelte/reactivity/window
use_cases: "window properties, reactive viewport dimensions, scroll position"
---

This module exports reactive versions of various `window` values, each of which has a reactive `current` property that you can reference in reactive contexts (templates, [deriveds]($derived) and [effects]($effect)) without using [`<svelte:window>`](svelte-window) bindings or manually creating your own event listeners.

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```

> MODULE: svelte/reactivity/window
