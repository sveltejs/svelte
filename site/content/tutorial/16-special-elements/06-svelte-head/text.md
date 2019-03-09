---
title: <svelte:head>
---

Lastly, `<svelte:head>` allows you to insert elements inside the `<head>` of your document:

```html
<svelte:head>
	<link rel="stylesheet" href="tutorial/dark-theme.css">
</svelte:head>
```

> In server-side rendering (SSR) mode, contents of `<svelte:head>` are returned separately from the rest of your HTML.