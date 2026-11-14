<script>
	let { push } = $props();

	let v = $derived(await push(1));

	console.log(`continued with ${v}`);
</script>

<p>{v}</p>
