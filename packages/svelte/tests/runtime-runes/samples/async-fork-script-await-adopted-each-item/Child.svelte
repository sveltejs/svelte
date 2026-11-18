<script>
	let { push, x } = $props();

	await push();

	console.log('continued');
</script>

<p>{x}</p>
