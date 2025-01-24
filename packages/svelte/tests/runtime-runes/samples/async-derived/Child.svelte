<script>
	let { promise, num } = $props();

	let value = $derived((await promise) * num);

	$effect(() => {
		console.log(`$effect ${value} ${num}`);
	});

	$effect.pre(() => {
		console.log(`$effect.pre ${value} ${num}`);
	});
</script>

<p>{value}{console.log(`template ${value} ${num}`)}</p>
