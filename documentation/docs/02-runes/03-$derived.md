---
title: $derived
tags: rune-derived
---

Derived state is declared with the `$derived` rune:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

The expression inside `$derived(...)` should be free of side-effects. Svelte will disallow state changes (e.g. `count++`) inside derived expressions.

As with `$state`, you can mark class fields as `$derived`.

> [!NOTE] Code in Svelte components is only executed once at creation. Without the `$derived` rune, `doubled` would maintain its original value even when `count` changes.

## `$derived.by`

Sometimes you need to create complex derivations that don't fit inside a short expression. In these cases, you can use `$derived.by` which accepts a function as its argument.

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

In essence, `$derived(expression)` is equivalent to `$derived.by(() => expression)`.

## Understanding dependencies

Anything read synchronously inside the `$derived` expression (or `$derived.by` function body) is considered a _dependency_ of the derived state. When the state changes, the derived will be marked as _dirty_ and recalculated when it is next read.

To exempt a piece of state from being treated as a dependency, use [`untrack`](svelte#untrack).

## Overriding derived values

Derived expressions are recalculated when their dependencies change, but you can temporarily override their values by reassigning them (unless they are declared with `const`). This can be useful for things like _optimistic UI_, where a value is derived from the 'source of truth' (such as data from your server) but you'd like to show immediate feedback to the user:

```svelte
<script>
	let { post, like } = $props();

	let likes = $derived(post.likes);

	async function onclick() {
		// increment the `likes` count immediately...
		likes += 1;

		// and tell the server, which will eventually update `post`
		try {
			await like();
		} catch {
			// failed! roll back the change
			likes -= 1;
		}
	}
</script>

<button {onclick}>🧡 {likes}</button>
```

> [!NOTE] Prior to Svelte 5.25, deriveds were read-only.

## Deriveds and reactivity

Unlike `$state`, which converts objects and arrays to [deeply reactive proxies]($state#Deep-state), `$derived` values are left as-is. For example, [in a case like this](/playground/untitled#H4sIAAAAAAAAE4VU22rjMBD9lUHd3aaQi9PdstS1A3t5XvpQ2Ic4D7I1iUUV2UjjNMX431eS7TRdSosxgjMzZ45mjt0yzffIYibvy0ojFJWqDKCQVBk2ZVup0LJ43TJ6rn2aBxw-FP2o67k9oCKP5dziW3hRaUJNjoYltjCyplWmM1JIIAn3FlL4ZIkTTtYez6jtj4w8WwyXv9GiIXiQxLVs9pfTMR7EuoSLIuLFbX7Z4930bZo_nBrD1bs834tlfvsBz9_SyX6PZXu9XaL4gOWn4sXjeyzftv4ZWfyxubpzxzg6LfD4MrooxELEosKCUPigQCMPKCZh0OtQE1iSxcsmdHuBvCiHZXALLXiN08EL3RRkaJ_kDVGle0HcSD5TPEeVtj67O4Nrg9aiSNtBY5oODJkrL5QsHtN2cgXp6nSJMWzpWWGasdlsGEMbzi5jPr5KFr0Ep7pdeM2-TCelCddIhDxAobi1jqF3cMaC1RKp64bAW9iFAmXGIHfd4wNXDabtOLN53w8W53VvJoZLh7xk4Rr3CoL-UNoLhWHrT1JQGcM17u96oES5K-kc2XOzkzqGCKL5De79OUTyyrg1zgwXsrEx3ESfx4Bz0M5UjVMHB24mw9SuXtXFoN13fYKOM1tyUT3FbvbWmSWCZX2Er-41u5xPoml45svRahl9Wb9aasbINJixDZwcPTbyTLZSUsAvrg_cPuCR7s782_WU8343Y72Qtlb8OYatwuOQvuN13M_hJKNfxann1v1U_B1KZ_D_mzhzhz24fw85CSz2irtN9w9HshBK7AQAAA==)...

```js
// @errors: 7005
let items = $state([ /*...*/ ]);

let index = $state(0);
let selected = $derived(items[index]);
```

...you can change (or `bind:` to) properties of `selected` and it will affect the underlying `items` array. If `items` was _not_ deeply reactive, mutating `selected` would have no effect.

## Destructuring

If you use destructuring with a `$derived` declaration, the resulting variables will all be reactive — this...

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let { a, b, c } = $derived(stuff());
```

...is roughly equivalent to this:

```js
function stuff() { return { a: 1, b: 2, c: 3 } }
// ---cut---
let _stuff = $derived(stuff());
let a = $derived(_stuff.a);
let b = $derived(_stuff.b);
let c = $derived(_stuff.c);
```

## Update propagation

Svelte uses something called _push-pull reactivity_ — when state is updated, everything that depends on the state (whether directly or indirectly) is immediately notified of the change (the 'push'), but derived values are not re-evaluated until they are actually read (the 'pull').

If the new value of a derived is referentially identical to its previous value, downstream updates will be skipped. In other words, Svelte will only update the text inside the button when `large` changes, not when `count` changes, even though `large` depends on `count`:

```svelte
<script>
	let count = $state(0);
	let large = $derived(count > 10);
</script>

<button onclick={() => count++}>
	{large}
</button>
```
