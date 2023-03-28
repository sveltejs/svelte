---
title: Shorthand class directive
---

Often, the name of the class will be the same as the name of the value it depends on:

<!-- prettier-ignore -->
```svelte
<div class:big={big}>
	<!-- ... -->
</div>
```

In those cases we can use a shorthand form:

```svelte
<div class:big>
	<!-- ... -->
</div>
```
