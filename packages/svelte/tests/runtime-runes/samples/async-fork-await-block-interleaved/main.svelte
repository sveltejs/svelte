<script>
	import { fork } from 'svelte';

	let input;
	let a = $state(0);
	let b = $state(0);
	let current_fork;

	/** @type {Map<string, Array<() => void>>} */
	const registry = new Map();
	/** @type {Map<string, Promise<number>>} */
	const promises = new Map();

	function f(tag, value) {
		const promise = new Promise((resolve) => {
			const key = tag + value;
			if (!registry.has(key)) registry.set(key, []);
			registry.get(key).push(() => resolve(value));
		});
		promises.set(tag, promise);
		return promise;
	}

	/** resolve the promises created for `tag` and `value` */
	function settle(tag, value) {
		for (const r of registry.get(tag + value) ?? []) r();
		registry.delete(tag + value);
	}

	function update_b() {
		b = +input.value;
	}

	function update_a_after_b() {
		const value = +input.value;
		promises.get('b').then(() => (a = value));
	}
</script>

<input bind:this={input}>
<button onclick={() => (a = +input.value)}>set a</button>
<button onclick={() => (current_fork = fork(update_b))}>set b (fork)</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={update_a_after_b}>set a after b resolves</button>
<button onclick={() => settle('a', +input.value)}>resolve a</button>
<button onclick={() => settle('b', +input.value)}>resolve b</button>

<div id="output">
	{#await f('a', a)}<i>pending</i>{:then v}<q>{v}</q>{/await}
	{#await f('b', b)}<i>pending</i>{:then v}<s>{v}|{a}</s>{/await}
</div>
