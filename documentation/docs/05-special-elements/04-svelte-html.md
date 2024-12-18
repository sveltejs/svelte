---
title: <svelte:html>
---

```svelte
<svelte:html attribute={value} onevent={handler} />
```

This element allows you to add attributes and event listeners to the `<html>` root (i.e. `document.documentElement`). This is useful for attributes such as `lang` which influence how the browser interprets the content.

```svelte
<!--- file: +layout.svelte --->
<script>
    let { data } = $props();
</script>

<svelte:html lang={data.lang}></svelte:html>
```

> [!NOTE] If you use SvelteKit version 2.13 or higher (and have `%svelte.htmlAttributes%` on the `<html>` tag in `app.html`), the attributes will automatically be server rendered and hydrated correctly. If you're using a custom server rendering setup, you can retrieve the server-rendered attributes string via `htmlAttributes` from the `render` method response and inject it into your HTML manually.

This element may only appear the top level of your component and must never be inside a block or element.
