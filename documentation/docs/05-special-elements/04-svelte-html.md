---
title: <svelte:html>
---

```svelte
<svelte:html attribute={value} onevent={handler} />
```

Similarly to `<svelte:body>`, this element allows you to add properties and listeners to events on `document.documentElement`. This is useful for attributes such as `lang` which influence how the browser interprets the content.

As with `<svelte:window>`, `<svelte:document>` and `<svelte:body>`, this element may only appear the top level of your component and must never be inside a block or element.
