<script>
	let { x, push } = $props();

	let v = $derived(await push(x));

	$effect(() => {
		console.log(`effect ${v} ${x}`);
	});

	// Keep this effect in the tree after its first run, so a stale DIRTY status cannot go unnoticed.
	$effect(() => {
		console.log('created');
		return () => console.log('destroyed');
	});
</script>

<p>{v} {x}</p>
