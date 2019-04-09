---
title: Derived stores
---

You can create a store whose value is based on the value of one or more *other* stores with `derived`. Building on our previous example, we can create a store that derives the time the page has been open:

```js
export const elapsed = derived(
	time,
	$time => Math.round(($time - start) / 1000)
);
```

> It's possible to derive a store from multiple inputs, and to explicitly `set` a value instead of returning it (which is useful for deriving values asynchronously). Consult the [API reference](docs/TK) for more information.