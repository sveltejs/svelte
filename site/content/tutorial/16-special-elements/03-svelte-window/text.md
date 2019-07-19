---
title: <svelte:window>
---

Just as you can add event listeners to any DOM element, you can add event listeners to the `window` object with `<svelte:window>`.

On line 33, add the `keydown` listener:

```html
<svelte:window on:keydown={handleKeydown}/>
```
Don't forget to add `preventDefault` modifier if you want to press any other key, e.g. after you have pressed `Tab` or `Ctrl + D`:

```html
<svelte:window on:keydown|preventDefault={handleKeydown}/>
```
