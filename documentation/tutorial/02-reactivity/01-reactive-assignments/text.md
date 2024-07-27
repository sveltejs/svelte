---
title: Assignments
---

At the heart of Svelte is a powerful system of _reactivity_ for keeping the DOM in sync with your application state — for example, in response to an event.

To demonstrate it, we first need to wire up an event handler. Replace line 9 with this:

```svelte
<button on:click={incrementCount}>
```

Inside the `incrementCount` function, all we need to do is change the value of `count`:

```js
function incrementCount() {
	count += 1;
}
```

Svelte 'instruments' this assignment with some code that tells it the DOM will need to be updated.


**Note:** As we can put any JavaScript inside the curly braces, if you call the method like below

```svelte
<button on:click={incrementCount()}>
```
The Svelte will call that method on component load, and you will get the result ‘Clicked 1 time’ in the button. So, to prevent that from happening, use arrow functions instead. This will be useful when you want to pass some data to the method on a click event. 

```svelte
<button on:click={() => incrementCount()}>
```


