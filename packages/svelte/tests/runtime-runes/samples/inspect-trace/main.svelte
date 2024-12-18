<script>
	let count = $state(0);
	let double = $derived(count * 2);

	let checked = $state(false);

	$effect(() => {
		$inspect.trace('effect');

		double;
		double >= 4 || checked;
	});
</script>

<button onclick={() => count++}>{double}</button>
<input type="checkbox" bind:checked />
