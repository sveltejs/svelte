<script>
	let { getX } = $props();

	$effect(() => {
		console.log('effect');
		return () => console.log(`teardown: x=${getX()}`);
	});
</script>

<p>child</p>
