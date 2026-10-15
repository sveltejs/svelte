<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let current_fork;

	/** @type {Map<number, Array<() => void>>} */
	const registry = new Map();

	function f(value) {
		return new Promise((resolve, reject) => {
			if (!registry.has(value)) registry.set(value, []);
			registry.get(value).push(() => (value < 0 ? reject(value) : resolve(value)));
		});
	}

	/** resolve the promises created for `value` */
	function settle(value) {
		for (const r of registry.get(value) ?? []) r();
		registry.delete(value);
	}
</script>

{#each [1, -1, 3, 10, 20, 30, 40, 50, -60] as value}
	<button onclick={() => (current_fork = fork(() => (b = value)))}>fork b = {value}</button>
{/each}
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>
<button onclick={() => (b = 2)}>b = 2</button>
{#each [4, 5, 6, 7, 8] as value}
	<button onclick={() => (a = value)}>a = {value}</button>
{/each}
{#each [0, 1, -1, 2, 3, 14, 7, 10, 15, 25, 24, 16, 36, 47, 17, 48, 58, -52] as value}
	<button onclick={() => settle(value)}>resolve({value})</button>
{/each}

<div id="output">
	{#await f(a + b)}<i>pending</i>{:then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
</div>
