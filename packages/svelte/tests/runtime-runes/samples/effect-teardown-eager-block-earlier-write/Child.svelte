<script>
	let { getCount, isShown } = $props();

	$effect(() => {
		console.log('setup');

		return () => {
			console.log(`teardown: count=${getCount()} show=${isShown()}`);
		};
	});
</script>

<p>child</p>
