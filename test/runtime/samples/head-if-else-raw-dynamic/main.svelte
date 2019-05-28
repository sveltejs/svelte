<script>
	export let condition, foo, bar;
</script>

<svelte:head>
	{#if condition}
		{@html foo}
	{:else}
		{@html bar}
	{/if}
</svelte:head>
