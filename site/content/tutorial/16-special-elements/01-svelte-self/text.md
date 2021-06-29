---
title: <svelte:self>
---

Svelte provides a variety of built-in elements. The first, `<svelte:self>`, allows a component to contain itself recursively.

It's useful for things like this folder tree view, where folders can contain *other* folders. In `Folder.svelte` we want to be able to do this...

```html
{#if file.files}
	<Folder {...file}/>
{:else}
	<File {...file}/>
{/if}
```

...but that's impossible, because a module can't import itself. Instead, we use `<svelte:self>`:

```html
{#if file.files}
	<svelte:self {...file}/>
{:else}
	<File {...file}/>
{/if}
```
