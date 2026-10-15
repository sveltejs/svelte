<script>
	import { fork } from 'svelte';

	let list = $state([0]);
	export const log = [];
	const registry = [];
	let current_fork;

	function f(value) {
		log.push(value);
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<button onclick={() => (current_fork = fork(() => (list = [])))}>fork empty</button>
<button onclick={() => (list = [])}>empty</button>
<button onclick={() => (list = [0])}>reset</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>

<main>{#each list as x (x)}<b>{x}</b>{:else}<p>{await f('empty')}</p>{/each}</main>
