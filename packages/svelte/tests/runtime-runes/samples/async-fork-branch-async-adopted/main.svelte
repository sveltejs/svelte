<script>
	import { fork } from 'svelte';

	let show = $state(false);
	const registry = [];
	let a;
	let b;

	function f(value) {
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function resolve_all() { for (const r of registry.splice(0)) r(); }
</script>

<button onclick={() => (a = fork(() => (show = true)))}>fork a</button>
<button onclick={() => (b = fork(() => (show = true)))}>fork b</button>
<button onclick={() => registry.shift()?.()}>resolve one</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => a?.discard()}>discard a</button>
<button onclick={() => b?.commit()}>commit b</button>

<main>{#if show}<section>{await f('s')}</section>{/if}</main>
