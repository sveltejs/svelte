<script>
	let { x, push } = $props();

	let v = $derived(await push(x));

	console.log(`continued with ${v}`);

	$effect(() => {
		console.log(`effect ${v} ${x}`);
	});

	// A never-run effect has no dependency edges for a batch's ordinary revalidation to discover.
	$effect(() => {
		console.log('created');
	});
</script>

<p>{v} {x}</p>
