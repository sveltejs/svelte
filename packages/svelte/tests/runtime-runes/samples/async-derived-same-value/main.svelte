<script>
	let count = $state(0);
	let unreactive = $derived(await push(count));

	function push(v) {
		if (!v) return v;

		return Promise.resolve(1);
	}
</script>

<button onclick={() => count++}>{unreactive}</button>
