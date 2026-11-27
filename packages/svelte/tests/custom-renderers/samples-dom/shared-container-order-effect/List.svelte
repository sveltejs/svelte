<svelte:options customRenderer="../../_renderer.ts" />

<script lang="ts">
	import Child from './Child.svelte';

	let { observe }: { observe: (keys: string) => void } = $props();
	let items = $state.raw(['a', 'b']);

	$effect(() => {
		observe(items.join(''));
	});
</script>

<button onclick={() => (items = items.toReversed())}>reverse</button>

{#each items as item (item)}
	<Child {item} />
{/each}
