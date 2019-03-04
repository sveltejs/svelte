---
title: Adding parameters
---

Transition functions can accept parameters. Replace the `fade` transition with `fly`...

```html
<script>
	import { fly } from 'svelte/transition';
	let visible = true;
</script>
```

...and apply it to the `<p>` along with some options:

```html
<p transition:fly="{{ y: 200, duration: 2000 }}">
	Flies in and out
</p>
```

Note that the transition is *reversible* — if you toggle the checkbox while the transition is ongoing, it transitions from the current point, rather than the beginning or the end.