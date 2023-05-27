<script>
	export let condition;
</script>

<svelte:head>
	{#if condition}
		<title>woo!!!</title>
	{/if}
</svelte:head>
