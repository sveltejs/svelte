<script>
	let n = $state(1);
	const v = $derived(await Promise.resolve(n));
	$effect(() => {
		console.log('run', v);
		return () => console.log('teardown', v);
	});
</script>

<button onclick={() => n++}>{v}</button>
