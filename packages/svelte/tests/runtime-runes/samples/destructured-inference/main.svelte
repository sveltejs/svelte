<script>
	let count = $state(0);
	const { value = { toString: () => count } } = () => {};
	const { ...rest } = 42;
	let state = $state(rest);
</script>

<button onclick={() => { count += 1; state.count = count; }}>increment</button>
<p>{value}</p>
<p>{state.count ?? 0}</p>
