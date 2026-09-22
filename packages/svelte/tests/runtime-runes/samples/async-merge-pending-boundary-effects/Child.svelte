<script>
	let { delay } = $props();
	let result = $derived(await delay());

	$effect(() => {
		console.log(result);
	});
</script>

<strong>{result}</strong>
