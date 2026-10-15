<script>
	import { fork } from 'svelte';

	let a = $state(0);
	let b = $state(0);
	let current_fork;

	/** @type {Map<string, Array<() => void>>} */
	const registry = new Map();

	function f(tag, value) {
		return new Promise((resolve) => {
			const key = tag + value;
			if (!registry.has(key)) registry.set(key, []);
			registry.get(key).push(() => resolve(value));
		});
	}

	/** resolve the promises created for `tag` and `value` */
	function settle(tag, value) {
		for (const r of registry.get(tag + value) ?? []) r();
		registry.delete(tag + value);
	}
</script>

{#each [10, 20, 30] as value}
	<button onclick={() => (current_fork = fork(() => (b = value)))}>fork b = {value}</button>
{/each}
<button onclick={() => current_fork?.commit()}>commit</button>
{#each [1, 2] as value}
	<button onclick={() => (a = value)}>a = {value}</button>
{/each}
{#each [0, 10, 20, 30] as value}
	<button onclick={() => settle('p', value)}>resolve p({value})</button>
{/each}
{#each [0, 11, 1, 21, 31, 32] as value}
	<button onclick={() => settle('aw', value)}>resolve aw({value})</button>
{/each}

<div id="output">
	<svelte:boundary>
		<p>{await f('p', b)}</p>
		{#await f('aw', a + b)}<i>pending</i>{:then v}<q>{v}</q>{/await}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</div>
