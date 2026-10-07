<script>
	import { fork } from 'svelte';

	let show = $state(false);
	let n = $state(0);
	export const log = [];
	const registry = [];
	let a;
	let b;

	function f(tag, value) {
		log.push(`${tag}${value}`);
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function set(values) {
		if ('show' in values) show = values.show;
		if ('n' in values) n = values.n;
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}

	function discard_a() {
		a?.discard();
		a = undefined;
	}

	function commit_a() {
		a?.commit();
		a = undefined;
	}

	function commit_b() {
		b?.commit();
		b = undefined;
	}
</script>

<button onclick={() => (a = fork(() => set({ show: true, n: 1 })))}>fork a</button>
<button onclick={() => set({ show: true })}>show</button>
<button onclick={() => (b = fork(() => set({ show: true })))}>fork b</button>
<button onclick={() => set({ show: false, n: 0 })}>reset</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={discard_a}>discard a</button>
<button onclick={commit_a}>commit a</button>
<button onclick={commit_b}>commit b</button>

<main>
	{#if show}<p>{await f('c', 'c')}</p>{/if}
	{#if show}<section>{n}|{await f('n', n)}</section>{/if}
</main>
