---
title: Assignments
---

At the heart of Svelte is a powerful system of *reactivity* for keeping the DOM in sync with your application state — for example, in response to an event.

To demonstrate it, we first need to wire up an event handler. Replace line 9 with this:

```html
<button on:click={incrementCount}>
```

Inside the `incrementCount` function, all we need to do is change the value of `count`:

```js
function incrementCount() {
	count += 1;
}
```

Svelte 'instruments' this assignment with some code that tells it the DOM will need to be updated.
