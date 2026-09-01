<script>
	let { track, value, ...rest } = $props();
	let indirect = $derived(rest.other);

	$effect(() => {
		track;

		return () => console.log(`value = ${value}, other = ${indirect}`);
	});
</script>
