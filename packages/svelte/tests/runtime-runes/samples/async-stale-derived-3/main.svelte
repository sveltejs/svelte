<script>
	let count = $state(0);
	let other = $state(0);

	const queue = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil) => {
			queue.push(() => fulfil(v));
		});
	}
</script>

<button onclick={() => {
	if (count === 0) other++;
	count++;
}}>increment</button>
<button onclick={() => queue.pop()?.()}>pop</button>

<p>{await push(count)} {count} {other}</p>
