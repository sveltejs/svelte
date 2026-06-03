<script>
	let { x } = $props();
	console.log(x);
	await Promise.resolve();
	console.log(x);
</script>

{x}
