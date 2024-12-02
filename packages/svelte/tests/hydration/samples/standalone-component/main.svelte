<script>
	import Child from './Child.svelte';
</script>

{#if true}
	<Child />
{/if}

{#each [1, 2, 3] as n}
	<Child />
{/each}
