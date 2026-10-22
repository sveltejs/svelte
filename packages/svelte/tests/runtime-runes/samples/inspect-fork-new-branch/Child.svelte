<script>
	let { count } = $props();

	$inspect(count).with((type, value) => console.log(`${type}: ${value}`));
</script>

<p>{count}</p>
