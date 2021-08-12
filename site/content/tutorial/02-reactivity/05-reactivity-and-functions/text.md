---
title: Reactivity and Functions
---

Svelte reactivity can be slightly unintuitive once you start declaring your own functions.

For example, you might have some code where a reactive variable is becoming a bit complex:

```js
let x = 0;
let k = 1;

$: y = (x*x+k) * (x*x+k) - k;
```

And want to abstract perhaps it's natural to think of there as being a function `f(x)` with `k` as a global variable:

```js
let x = 0;
let k = 1;

function f(x) {
    let z = x*x + k;
    return z * z - k;
}

$: y = f(x);
```

In this code, `y` will update when `x` changes but not when `k` changes. This is because, from svelte's perspective:

* `y` is a function of `f` and `x`
* `f` is not reactive
* Therefore, `y` only recomputes when `x` changes

To get our intuitive expected behavior, we need to make `f` a reactive variable:

```js
$: f = function (x) {
    let z = x*x + k;
    return z * z - k;
}
```

Now from svelte's perspective:
* `y` is a function of `f` and `x`
* `f` is a function of `k`
* Therefore, `y` updates when `x` or `k` change.

To summarize:

```js
let a = 0;

let f = () => a; // f will *not* reactively update
$: b = f();      // b will *not* reactively update
$: b = f(a);     // b will reactively update (svelte thinks f hasn't changed, but a has)

$: g = () => a;  // g will reactively update
$: b = g();      // b will reactively update
$: b = g(a);     // b will reactively update
```