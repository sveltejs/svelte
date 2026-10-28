<script>
	let { getX, getDouble } = $props();

	$effect(() => {
		console.log(`setup: x=${getX()} double=${getDouble()}`);

		return () => console.log(`teardown: x=${getX()} double=${getDouble()}`);
	});
</script>

<p>child</p>
