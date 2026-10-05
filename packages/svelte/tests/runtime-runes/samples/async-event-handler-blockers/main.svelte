<script>
	// Wait a macrotask to make sure the handlers aren't read before the microtask-Promise.resolve() resolves, masking a bug
	await new Promise((r) => setTimeout(r));

	function create_handler(name) {
		return () => {
			console.log(name);
		};
	}

	const onclick = create_handler('click');
	const onmouseenter = create_handler('mouseenter');
	const onresize = create_handler('resize');
</script>

<svelte:window {onresize} />

<button {onclick}>click</button>
<div {onmouseenter}>hover</div>
