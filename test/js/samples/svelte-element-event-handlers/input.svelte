<script>
	const a = 'a';
	const span = 'span';
</script>

<svelte:element this={a} class='outer' on:keydown on:keyup>
	<svelte:element this={span} class='inner' on:keydown on:keyup />
</svelte:element>
