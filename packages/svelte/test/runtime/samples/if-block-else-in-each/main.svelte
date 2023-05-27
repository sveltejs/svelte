<script>
	export let array;
</script>

{#each array as item}
	{#if item}
		<div>foo</div>
	{:else}
		<div>bar</div>
	{/if}
{/each}
