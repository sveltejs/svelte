<script>
	let count = $state(0);
	const derived = $derived(Math.floor(count / 2));
	const derived2 = $derived(derived * 2);

	$effect(() => {
		console.log(derived2);
	});
</script>

<button on:click={() => count += 1}>
	clicks: {count}
</button>
