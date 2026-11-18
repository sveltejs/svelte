<script>
	let { a, push } = $props();

	let q = $derived(await push('q', a));

	$effect(() => {
		console.log(q);
	});
</script>

<p>q: {q}</p>
