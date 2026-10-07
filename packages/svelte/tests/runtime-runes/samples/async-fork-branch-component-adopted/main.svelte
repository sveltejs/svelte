<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
	let n = $state(0);
	export const log = [];
	const registry = [];
	let a;

	function f(value) {
		log.push(value);
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function set(values) {
		if ('show' in values) show = values.show;
		if ('n' in values) n = values.n;
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<button onclick={() => (a = fork(() => set({ show: true, n: 1 })))}>fork</button>
<button onclick={() => set({ show: true })}>show</button>
<button onclick={() => set({ show: false, n: 0 })}>reset</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => a?.discard()}>discard</button>
<button onclick={() => a?.commit()}>commit</button>

<main>{#if show}<Child {f} {n} />{/if}</main>
