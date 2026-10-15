<script>
	import { fork } from 'svelte';

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
</script>

{#each [1, 2] as value}
	<button onclick={() => (current_fork = fork(() => (b = value)))}>fork b = {value}</button>
{/each}
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => (a = 1)}>a = 1</button>
<button onclick={() => promises.get('b').then(() => (a = 5))}>a = 5 after b resolves</button>
{#each [0, 1, 5] as value}
	<button onclick={() => settle('a', value)}>resolve a({value})</button>
{/each}
{#each [0, 1, 2] as value}
	<button onclick={() => settle('b', value)}>resolve b({value})</button>
{/each}

<div id="output">
	{#await f('a', a)}<i>pending</i>{:then v}<q>{v}</q>{/await}
	{#await f('b', b)}<i>pending</i>{:then v}<s>{v}|{a}</s>{/await}
</div>
