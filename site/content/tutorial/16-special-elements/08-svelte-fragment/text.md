---
title: <svelte:fragment>
---

The `<svelte:fragment>` element allows you to add content to a named slot without breaking the document's flow layout.

In the example notice how we applied a flex layout with a gap of 2em to the box.

```sv
<!-- Box.svelte -->
<style>
	.box {
		width: 300px;
		border: 1px solid #aaa;
		border-radius: 2px;
		box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
		padding: 1em;
		margin: 0 0 1em 0;
		
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

The content in the footer however is not spaced out according to this rythm because wrapping it in a div created a new flow layout.

We can solve this by changing `<div slot="footer">` in the `App` component:

```sv
<svelte:fragment slot="footer">
	<p>All rights reserved.</p>
	<p>Copyright (c) 2019 Svelte Industries</p>
</svelte:fragment>
```

