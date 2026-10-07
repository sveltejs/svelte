<script>
	import { fork } from 'svelte';

	let list = $state([0, 1]);
	const registry = [];
	let current_fork;

	function f(value) {
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}

	function resolve_all() { for (const r of registry.splice(0)) r(); }
</script>

<button onclick={() => (current_fork = fork(() => (list = [3, 2, 1, 0])))}>fork list</button>
<button onclick={() => (list = [3, 0, 1])}>real list</button>
<button onclick={resolve_all}>resolve all</button>
<button onclick={() => current_fork?.discard()}>discard</button>

<main>
	<svelte:boundary>
		{#each list as x}<s>{x}|{await f(x)}</s>{/each}
		{#snippet pending()}{/snippet}
	</svelte:boundary>
</main>
