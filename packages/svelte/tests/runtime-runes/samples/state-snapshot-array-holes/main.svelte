<script>
	let arr = []
	arr[5] = true

	let state = $state([])
	state[5] = true
</script>

<div>{2 in $state.snapshot(state)}</div>
<div>{5 in $state.snapshot(state)}</div>
