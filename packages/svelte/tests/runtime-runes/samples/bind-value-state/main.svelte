<script>
	let v = $state(0)
	let count = {
		get v() { return v },
		set v(x) { {
			v = Math.min(100, +x)
		}},
	};
</script>
<input bind:value={count.v} type="number">
<div>{count.v}</div>
