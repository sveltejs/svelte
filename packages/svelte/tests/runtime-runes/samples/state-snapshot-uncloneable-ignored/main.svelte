<script>
	let arr = $state({
		test: () => {}
	});

	// svelte-ignore state_snapshot_uncloneable
	$state.snapshot(arr);
</script>

<!-- svelte-ignore state_snapshot_uncloneable -->
<div {...$state.snapshot(arr)}>a</div>
