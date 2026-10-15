<script>
	import { fork } from 'svelte';

	let b = $state(0);
	let current_fork;
	export const registry = [];

	function f(value) {
		return new Promise((resolve, reject) =>
			registry.push(() => (value < 0 ? reject(value) : resolve(value)))
		);
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

{#each [2, -1, 3, -2, 5, 6, 7] as value}
	<button onclick={() => (current_fork = fork(() => (b = value)))}>fork b = {value}</button>
{/each}
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>
<button onclick={() => (b = 4)}>b = 4</button>

<div id="output">
	{#await f(b) then v}<q>{v}</q>{:catch e}<s>{e}</s>{/await}
</div>
