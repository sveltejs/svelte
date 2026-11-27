<script>
	let { value = '', register } = $props();

	register((v) => (value = v));
</script>

<p>{value}</p>
