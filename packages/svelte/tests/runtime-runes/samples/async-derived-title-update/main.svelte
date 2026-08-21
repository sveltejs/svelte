<script>
	let promise = Promise.resolve('hello');
	const value = $derived(await promise);
</script>

<svelte:head>
	<title>{value}</title>
</svelte:head>

<p>{value}</p>
