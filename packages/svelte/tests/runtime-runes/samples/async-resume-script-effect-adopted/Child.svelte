<script>
	let { x, push } = $props();

	let v = $derived(await push(x));

	console.log(`continued with ${v}`);

	$effect(() => {
		console.log(`effect ${v} ${x}`);
	});
</script>

<p>{v} {x}</p>
