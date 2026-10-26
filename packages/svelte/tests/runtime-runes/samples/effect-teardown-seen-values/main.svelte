<script>
	let go = $state(false);
	let x = $state(0);
	let z = $state(0);

	$effect(() => {
		console.log(`before: x=${x}`);
		return () => console.log(`before cleanup: x=${x}`);
	});

	$effect(() => {
		if (go) x = 1;
	});

	$effect(() => {
		console.log(`after: x=${x} z=${z}`);
		return () => console.log(`after cleanup: x=${x} z=${z}`);
	});

	$effect(() => {
		if (go) z = 1;
	});
</script>

<button onclick={() => (go = true)}>go</button>
