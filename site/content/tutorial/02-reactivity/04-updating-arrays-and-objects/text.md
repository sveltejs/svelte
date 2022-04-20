---
title: Updating arrays and objects
---

Svelte's reactivity is triggered by assignments. Methods that mutate arrays/objects internally will not trigger updates by themselves.

In this example, clicking the "Add a number" button calls the `addNumber` function, which appends a number to the array but doesn't trigger the recalculation of `sum` and does not update the rendered page.

One way to fix that would be to assign `numbers` to itself to tell the compiler it has changed:

```js
function addNumber() {
	numbers.push(numbers.length + 1);
	numbers = numbers;
}
```

You can also get a similar result using the ES6 spread syntax:

```js
function addNumber() {
	numbers = [...numbers, numbers.length + 1];
}
```

The same rule applies for other array methods such as `pop`, `shift`, `splice` and for other objects such as `Map.set`.

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