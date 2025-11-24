<script>

	// Wait a macrotask to make sure the effect doesn't run before the microtask-Promise.resolve() resolves, masking a bug
	await new Promise(r => setTimeout(r));

	function run(_, arg) {
		console.log(arg);
	}

	let value = $state('ready');
</script>

<div use:run={value}></div>
