<script>
	let { promise } = $props();
	let p;

	$effect(() => {
		console.log(p.textContent);
	});
</script>

<p bind:this={p}>{await promise}</p>
