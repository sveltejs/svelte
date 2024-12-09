<script>
	let [count, invalidate_count] = $state.opaque(0);
	let [value, invalidate_value] = $state.opaque({ count: 0 });
</script>

<button onclick={() => {
	count++
	value.count++
}}>+</button>

<button onclick={() => {
	invalidate_count();
	invalidate_value();
}}>invalidate</button>

<div>{count}</div>
<div>{value.count}</div>

<input bind:value={count}>
