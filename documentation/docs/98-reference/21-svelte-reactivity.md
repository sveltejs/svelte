---
title: svelte/reactivity
---

Svelte provides reactive versions of various built-ins like `SvelteMap`, `SvelteSet` and `SvelteURL`. These can be imported from `svelte/reactivity` and used just like their native counterparts.

```svelte
<script>
	import { SvelteURL } from 'svelte/reactivity';

	const url = new SvelteURL('https://example.com/path');
</script>

<!-- changes to these... -->
<input bind:value={url.protocol} />
<input bind:value={url.hostname} />
<input bind:value={url.pathname} />

<hr />

<!-- will update `href` and vice versa -->
<input bind:value={url.href} />
```

The utilities provided in `svelte/reactivity` are automatically reactive with respect to their properties and methods, as seen in the previous example. As such, they don't need to be wrapped in `$state`. However, if a variable is reassigned, it needs to be wrapped in a `$state` in order for this reassignement to be reactive.

```svelte
<script>
	import { SvelteURL } from 'svelte/reactivity';

	let url = $state(new SvelteURL('https://example.com/path'));
</script>

<!-- these are reactive... -->
Protocol: {url?.protocol ?? "ftp:"}
<br>
Hostname: {url?.hostname ?? "svelte.dev"}
<br>
Path: {url?.pathname ?? ""}

<hr />

<!-- ...even when reassigning -->
<button
	onclick={() => {
		url = undefined;
	}}
>
	Erase
</button>
```

In a similar manner, the values stored inside e.g. `SvelteMap` are not automatically reactive, so if more complex values such as objects are used, they need to be wrapped in a `$state` in order to make their properties reactive as well. Alternatively, the whole object can be rewritten on update, which may actually lead to better performance than deep reactive `$state`.

```svelte
<script>
	import { SvelteMap } from 'svelte/reactivity';

	const people = new SvelteMap();

	// A plain object
	const alice = {name: "Alice", age: 18};

	// A reactive object
	const bob = $state({name: "Bob", age: 21});

	people.set("alice", alice);
	people.set("bob", bob);
</script>

{#each people.entries() as [id, person] (id)}
	Name: {person.name}
	<br>
	Age: {person.age}
	<br>
	<br>
{/each}

<hr />

<!-- This will NOT propagate reactively, because alice is a plain object -->
<button
	onclick={() => {
		people.get("alice").age++;
	}}
>
	Alice's birthday
</button>

<!-- This WILL propagate reactively, because bob is a reactive object -->
<button
	onclick={() => {
		people.get("bob").age++;
	}}
>
	Bob's birthday
</button>

<!-- This WILL propagate reactively, because people is reactive -->
<button
	onclick={() => {
		people.set("carol", {name: "Carol", age: 0});
	}}
>
	Carol was born
</button>

{#if people.has("carol")}
	<!-- This WILL propagate reactively, because we are replacing the whole carol object -->
	<button
		onclick={() => {
			const oldValue = people.get("carol");
			people.set("carol", {...oldValue, age: oldValue.age + 1});
		}}
	>
		Carol's birthday
	</button>
{/if}
```

> MODULE: svelte/reactivity
