<script>
	let { x, push } = $props();

	let v = $derived(await push('v', x));

	console.log(`continued with ${v}`);
</script>

<span>{v}</span>
