---
title: Updating arrays and objects
---

Because Svelte's reactivity is triggered by assignments, using array methods like `push` and `splice` won't automatically cause updates. For example, clicking the button doesn't do anything.

One way to fix that is to add an assignment that would otherwise be redundant:

```js
function addNumber() {
	numbers.push(numbers.length + 1);
	numbers = numbers;
}
```

But there's a more idiomatic solution:

```js
function addNumber() {
	numbers = [...numbers, numbers.length + 1];
}
```

You can use similar patterns to replace `pop`, `shift`, `unshift` and `splice`.

Assignments to *properties* of arrays and objects — e.g. `obj.foo += 1` or `array[i] = x` — work the same way as assignments to the values themselves.

```js
function addNumber() {
	numbers[numbers.length] = numbers.length + 1;
}
```
As a rule of thumb _The name of the reactive variable must appear on the left side of the equals to react to assignments._

For example, this case wouldn't work:
```js
const childRef = obj.foo;
childRef.bar = "new value";
```

And to make it work it would be needed to force an update to object with `obj = obj`.
