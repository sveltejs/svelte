---
title: <svelte:window> bindings
---

We can also bind to certain properties of `window`, such as `scrollY`. Update line 7:

```svelte
<svelte:window bind:scrollY={y} />
```

The list of properties you can bind to is as follows:

- `innerWidth`
- `innerHeight`
- `outerWidth`
- `outerHeight`
- `scrollX`
- `scrollY`
- `online` — an alias for `window.navigator.onLine`

All except `scrollX` and `scrollY` are readonly.
