<svelte:options customRenderer={null} />

<script module lang="ts">
	import Grandchild from './Grandchild.svelte';
	export { Grandchild };
</script>

<script lang="ts">
	import Child from './Child.svelte';

	let items = $state.raw<string[]>([]);
</script>

<button onclick={() => (items = ['a', 'b'])}>show</button>
<button onclick={() => (items = items.toReversed())}>reverse</button>

<output>
	{#each items as item (item)}
		<Child {item} />
	{/each}
</output>
