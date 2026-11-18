<script>
	let {count,push} = $props();

	const shown = $derived(await push(count + 1));
	const held = $derived(await push(shown + 1));
</script>

<output>{held}</output>
