<script>
	let { big } = $props();

	const label = $derived(big ? true : false);

	$effect(() => {
		console.log(`effect ${label}`);
	});
</script>

<p>child</p>
