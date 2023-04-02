---
title: Slot fallbacks
---

A component can specify _fallbacks_ for any slots that are left empty, by putting content inside the `<slot>` element:

```svelte
<div class="box">
	<slot>
		<em>no content was provided</em>
	</slot>
</div>
```

We can now create instances of `<Box>` without any children:

```svelte
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>

<Box />
```
