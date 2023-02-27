---
title: Updating arrays and objects
---

Svelte's reactivity is triggered by assignments. Methods that mutate arrays or objects will not trigger updates by themselves.

In this example, clicking the "Add a number" button calls the `addNumber` function, which appends a number to the array but doesn't trigger the recalculation of `sum`.

One way to fix that is to assign `numbers` to itself to tell the compiler it has changed:

```js
function addNumber() {
	numbers.push(numbers.length + 1);
	numbers = numbers;
}
```

You could also write this more concisely using the ES6 spread syntax:

```js
function addNumber() {
	numbers = [...numbers, numbers.length + 1];
}
```

The same rule applies to array methods such as `pop`, `shift`, and `splice` and to object methods such as `Map.set`, `Set.add`, etc.

Assignments to *properties* of arrays and objects — e.g. `obj.foo += 1` or `array[i] = x` — work the same way as assignments to the values themselves.

```js
function addNumber() {
	numbers[numbers.length] = numbers.length + 1;
}
```

However, indirect assignments to references such as this...

```js
const foo = obj.foo;
foo.bar = 'baz';
```

or 

```js
function quox(thing) {
	thing.foo.bar = 'baz';
}
quox(obj);
```

...won't trigger reactivity on `obj.foo.bar`, unless you follow it up with `obj = obj`.

A simple rule of thumb: the updated variable must directly appear on the left hand side of the assignment.
