<script module lang="ts">
	import Child from './Child.svelte';
	export { Child };
</script>

<script lang="ts">
	let items = $state.raw<string[]>([]);
</script>

<button onclick={() => (items = ['a', 'b'])}>show</button>
<button onclick={() => (items = items.toReversed())}>reverse</button>

{#each items as item (item)}
	<Child {item} />
{/each}
