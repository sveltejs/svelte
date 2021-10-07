---
title: Statements
---

We're not limited to declaring reactive *values* — we can also run arbitrary *statements* reactively. For example, we can log the value of `count` whenever it changes:

```js
$: console.log(`the count is ${count}`);
```

You can easily group statements together with a block:

```js
$: {
	console.log(`the count is ${count}`);
	alert(`I SAID THE COUNT IS ${count}`);
}
```

You can even put the `$:` in front of things like `if` blocks:

```js
$: if (count >= 10) {
	alert(`count is dangerously high!`);
	count = 9;
}
```

It is worth noting that you will never be alerted that `count` is 10. Regardless of the order of these two blocks, you will first be alerted that `count` is dangerously high before it is reset to 9. Only after this is it then logged to the console and used in the alert. 
```js
$: {
	console.log(`the count is ${count}`);
	alert(`I SAID THE COUNT IS ${count}`);
}
```
```js
$: if (count >= 10) {
	alert(`count is dangerously high!`);
	count = 9;
}
```
