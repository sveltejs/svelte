<script>
	import { fork } from 'svelte';

	let list = $state([0]);
	let show = $state(false);
	export const log = [];
	const registry = [];
	let a;

	function f(tag, value) {
		log.push(`${tag}${value}`);
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function set(values) {
		if ('list' in values) list = values.list;
		if ('show' in values) show = values.show;
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<button onclick={() => (a = fork(() => set({ list: [0, 1], show: true })))}>fork</button>
<button onclick={() => set({ list: [0, 1], show: true })}>list and show</button>
<button onclick={() => set({ list: [0, 1] })}>list</button>
<button onclick={() => set({ show: true })}>show</button>
<button onclick={() => set({ list: [0], show: false })}>reset</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => a?.discard()}>discard</button>
<button onclick={() => a?.commit()}>commit</button>

<main>
	<svelte:boundary>
		{#each list as x (x)}
			<div>{x}|{await f('x', x)}{#if show}<p>{await f('p', x)}</p>{/if}</div>
		{/each}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</main>
