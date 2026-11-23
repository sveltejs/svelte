<script>
	let { count } = $props();

	$effect(() => {
		console.log(`effect: ${count}`);
		return () => console.log(`teardown: ${count}`);
	});
</script>

<p>{count}</p>
