---
title: Slots
---

Just like elements can have children...

```html
<div>
	<p>I'm a child of the div</p>
</div>
```

...so can components. Before a component can accept children, though, it needs to know where to put them. We do this with the `<slot>` element. Put this inside `Box.svelte`:

```html
<div class="box">
	<slot></slot>
</div>
```

You can now put things in the box:

```html
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>
```