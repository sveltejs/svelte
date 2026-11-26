<script>
	let foo = $state(null);

	$effect(() => {
		foo = 69;
	});

	let bar = $derived(await 1);

	let baz = $derived(foo ? foo * bar : null);

	const qux = "qux";
</script>

<p>baz: {baz}</p>

<svelte:boundary>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}

	{#if qux}
		<p></p>
	{/if}
</svelte:boundary>
