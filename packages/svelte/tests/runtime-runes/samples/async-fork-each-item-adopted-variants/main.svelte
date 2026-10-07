<script>
	import { fork } from 'svelte';

	let list = $state([0, 1]);
	export const log = [];
	const registry = [];
	let current_fork;

	function f(tag, value) {
		log.push(`${tag}${value}`);
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function resolve_all() {
		for (const r of registry.splice(0)) r();
	}
</script>

<button onclick={() => (list = [0, 1])}>reset</button>
<button onclick={() => (current_fork = fork(() => (list = [3, 2, 1, 0])))}>fork list</button>
<button onclick={() => (list = [3, 0, 1])}>real list</button>
<button onclick={() => (current_fork = fork(() => (list = [0, 1, 2])))}>fork append 2</button>
<button onclick={() => (list = [0, 1, 2])}>append 2</button>
<button onclick={() => (list = [0, 1, 5])}>append 5</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>
<button onclick={() => current_fork?.commit()}>commit</button>

<main>
	<svelte:boundary>
		{#each list as x (x)}<b>{x}|{await f('k', x)}|{await f('c', 'c')}</b>{/each}
		{#each list as x}<s>{x}|{await f('u', x)}</s>{/each}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</main>
