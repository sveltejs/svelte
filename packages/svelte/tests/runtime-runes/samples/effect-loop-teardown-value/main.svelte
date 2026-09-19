<script>
	let start = $state(false);
	let enabled = $state(false);
	let advance = $state(false);
	let value = $state('one');

	$effect(() => {
		if (start) {
			value = 'two';
			enabled = true;
		}
	});

	$effect(() => {
		if (enabled) {
			console.log(`setup: ${value}`);
			advance = true;

			return () => console.log(`cleanup: ${value}`);
		}
	});

	$effect(() => {
		if (advance) enabled = false;
	});
</script>

<button onclick={() => (start = true)}>start</button>
