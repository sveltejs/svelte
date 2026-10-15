<script>
	import { fork } from 'svelte';

	let b = $state(0);
	let current_fork;

	/** @type {Map<number, Array<() => void>>} */
	const registry = new Map();

	function f(value) {
		return new Promise((resolve) => {
			if (!registry.has(value)) registry.set(value, []);
			registry.get(value).push(() => resolve(value));
		});
	}

	/** resolve the promises created for `value` */
	function settle(value) {
		for (const r of registry.get(value) ?? []) r();
		registry.delete(value);
	}
</script>

<button onclick={() => (current_fork = fork(() => (b = 1)))}>fork</button>
<button onclick={() => settle(0)}>resolve(0)</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => settle(1)}>resolve(1)</button>

<div id="output">
	{#await f(b)}<i>pending</i>{:then v}<q>{v}</q>{/await}
</div>
