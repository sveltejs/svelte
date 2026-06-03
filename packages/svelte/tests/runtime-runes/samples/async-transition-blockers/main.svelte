<script>
	// Wait a macrotask to make sure the effect doesn't run before the microtask-Promise.resolve() resolves, masking a bug
	await new Promise(r => setTimeout(r));

	function custom(_, value) {
		console.log(value);
		return { duration: 0 };
	}

	let params = $state('ready');
</script>

<div transition:custom={params}></div>
