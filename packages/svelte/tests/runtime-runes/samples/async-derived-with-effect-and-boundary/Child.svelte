<script>
	let foo = $state(null);

	$effect(() => {
		foo = 69;
	});

	let bar = $derived(await 1);
	let baz = $derived(foo ? foo * bar : null);

	const qux = "qux";
</script>

<p id="bar">bar: {bar}</p>
<p id="baz">baz: {baz}</p>
{#if qux}
	<p></p>
{/if}
