<script>
	let count = $state(1);
	let derived_value = $derived(count * count);

	$effect(() => {
		console.log(`$effect: ${derived_value}`);
		return () => {
			console.log(`$effect teardown: ${derived_value}`);
		};
	});
</script>

<button id="increment" onclick={() => count++}>Increment s</button>
<button id="overwrite" onclick={() => (derived_value = 7)}>Overwrite derived_value</button>

<p>count: {count}</p>
<p>derived_value: {derived_value}</p>
