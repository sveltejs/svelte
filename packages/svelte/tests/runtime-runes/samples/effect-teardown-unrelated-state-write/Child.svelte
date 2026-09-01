<script>
	let { track, value, ...rest } = $props();

	$effect(() => {
		track;

		return () => console.log(`value = ${value}, other = ${rest.other}`);
	});
</script>
