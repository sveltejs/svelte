<script>
	export let visible = false;

	export let items = [{ value: 'a', ref: null }];
</script>

{#if visible}
	{#each items as item}
		<div bind:this={item.ref}>{item.value}</div>
	{/each}
{/if}
