---
title: <svelte:fragment>
---

The `<svelte:fragment>` element allows you to place content in a [named slot](legacy-slots) without wrapping it in a container DOM element. This keeps the flow layout of your document intact.

```svelte
<!--- file: Widget.svelte --->
<div>
	<slot name="header">No header was provided</slot>
	<p>Some content between header and footer</p>
	<slot name="footer" />
</div>
```

```svelte
<!--- file: App.svelte --->
<script>
	import Widget from './Widget.svelte';
</script>

<Widget>
	<h1 slot="header">Hello</h1>
	<svelte:fragment slot="footer">
		<p>All rights reserved.</p>
		<p>Copyright (c) 2019 Svelte Industries</p>
	</svelte:fragment>
</Widget>
```

> [!NOTE]
> In Svelte 5+, this concept is obsolete, as snippets don't create a wrapping element
