---
title: Slots
---

Just like elements can have children...

```svelte
<div>
	<p>I'm a child of the div</p>
</div>
```

...so can components. Before a component can accept children, though, it needs to know where to put them. We do this with the `<slot>` element. Put this inside `Box.svelte`:

```svelte
<div class="box">
	<slot />
</div>
```

You can now put things in the box:

```svelte
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>
```
