<script>
	export let bar;
</script>

<svelte:head>
	<meta id="meta" name="title" content="bar!!!"/>
	{#if true}
		{@html bar}
	{/if}
	<title>bar!!!</title>
</svelte:head>
