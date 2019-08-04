---
title: <svelte:window>
---

Just as you can add event listeners to any DOM element, you can add event listeners to the `window` object with `<svelte:window>`.

On line 33, add the `keydown` listener:

```html
<svelte:window on:keydown={handleKeydown}/>
```

> As with DOM elements, you can add [event modifiers](tutorial/event-modifiers) like `preventDefault`.
