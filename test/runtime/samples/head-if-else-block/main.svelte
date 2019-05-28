<script>
	export let condition;
</script>

<svelte:head>
	{#if condition}
		<title>woo!!!</title>
	{:else}
		<meta id="meta" name="title" content="woo!!!"/>
	{/if}
</svelte:head>
