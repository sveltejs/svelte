<script>
	let {count,push} = $props();

	const shown = $derived(await push(count + 1));
	const next = $derived(shown + 1);
	const held = $derived(await push(next));
</script>

<output>{held}</output>
