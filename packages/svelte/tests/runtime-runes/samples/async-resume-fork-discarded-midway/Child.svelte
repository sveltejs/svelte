<script>
	let { x, push } = $props();

	let a = $derived(await push(`a${x}`));
	let b = $derived(await push(`b${a}`));
</script>

<p>{a} {b}</p>
