<script>
	let { x, push } = $props();

	let v = $derived(await push(x));
	let w = $derived(v * 10);

	console.log(`continued with ${v}`);
</script>

<p>{v} {w}</p>
