<script>
	let { getX, getDouble } = $props();

	$effect.pre(() => {
		console.log(`child setup: x=${getX()} double=${getDouble()}`);

		return () => console.log(`child teardown: x=${getX()} double=${getDouble()}`);
	});
</script>

<p>child</p>
