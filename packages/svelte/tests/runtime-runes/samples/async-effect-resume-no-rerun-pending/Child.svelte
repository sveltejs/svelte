<script>
	let { big } = $props();

	$effect(() => {
		console.log(`effect ${big}`);
	});
</script>

<p>child</p>
