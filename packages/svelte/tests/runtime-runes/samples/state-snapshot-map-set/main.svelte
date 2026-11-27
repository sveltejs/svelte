<script>
	let item = $state({ value: 1 });
	let map = $state(new Map([['key', item]]));
	let set = $state(new Set([item]));
	let map_snapshot = $state.snapshot(map);
	let set_snapshot = $state.snapshot(set);
</script>

<button onclick={() => (item.value = 2)}>mutate</button>
<p>{map_snapshot.get('key').value} {[...set_snapshot][0].value}</p>
