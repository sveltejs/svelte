<script module>
	const data = $state({
		list: [],
		derived: 0
	});

	const derived = $derived(data.list.filter(() => true));

	const state = {
		data,
		get derived() { return derived }
	};
</script>

<script>
	data.list.length = 0;
	$inspect(state);
</script>

<button onclick={() => (state.data.list.push(1))}>update</button>
{state.data.list}
