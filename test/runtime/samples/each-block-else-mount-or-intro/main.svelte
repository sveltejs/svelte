<script>
	export let items;

	import Widget from './Widget.svelte';
</script>

{#each items as item}
	<Widget {item}/>
{:else}
	No items.
{/each}
