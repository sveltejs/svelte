<script>
	let count = $state(0);
	let double = $derived(count * 2);

	$effect(() => {
		$inspect.trace('effect');

		double;
	})
</script>

<button onclick={() => count++}>{double}</button>
