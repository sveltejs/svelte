<script>
	let count = $state(null);
	$effect(() => {
		$inspect.trace();
		count;
	});
</script>

<button onclick={()=>count++}>{count}</button>