<script>
	let x = $state({count: 0});

	$inspect({x}, [x]);
</script>

<button on:click={() => x.count++}>{x.count}</button>
