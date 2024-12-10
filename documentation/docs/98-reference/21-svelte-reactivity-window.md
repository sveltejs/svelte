---
title: svelte/reactivity/window
---

This module exports reactive versions of various `window` properties, which you can use in components and [deriveds]($derived) and [effects]($effect) without using [`<svelte:window>`](svelte-window) bindings or manually creating your own event listeners.

```svelte
<script>
	import { innerWidth, innerHeight } from 'svelte/reactivity/window';
</script>

<p>{innerWidth.current}x{innerHeight.current}</p>
```

> MODULE: svelte/reactivity/window
