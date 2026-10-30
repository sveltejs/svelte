<script>
	let { count } = $props();

	$effect(() => {
		console.log(`effect ${count}`);
	});
</script>

<span>child {count}</span>
