<script>
	const { initial = 0 } = $props();

	let count = $state(initial);

	$effect.pre(() => {
		if (count > 1) {
			throw 'too high';
		}
	});
</script>

{count}

<button onclick={() => count++}>+</button>
