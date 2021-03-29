---
title: <svelte:fragment>
---

The `<svelte:fragment>` element allows you to place content in a named slot without wrapping it in a container DOM element. This keeps the flow layout of your document intact.

In the example notice how we applied a flex layout with a gap of `1em` to the box.

```sv
<!-- Box.svelte -->
<style>
	.box {		
		display: flex;
		flex-direction: column;
		gap: 1em;
	}
</style>

<div class="box">
	<slot name="header">No header was provided</slot>
	<p>Some content between header and footer</p>
	<slot name="footer"></slot>
</div>
```

However, the content in the footer is not spaced out according to this rhythm because wrapping it in a div created a new flow layout.

We can solve this by changing `<div slot="footer">` in the `App` component. Replace the `<div>` with `<svelte:fragment>`:

```sv
<svelte:fragment slot="footer">
	<p>All rights reserved.</p>
	<p>Copyright (c) 2019 Svelte Industries</p>
</svelte:fragment>
```
