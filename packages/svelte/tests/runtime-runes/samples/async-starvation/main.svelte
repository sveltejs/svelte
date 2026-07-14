<script>
	let count = $state(0);
	const deferred = new Map();

	function delay(value) {
		if (value === 0) return value;

		return new Promise((resolve) => {
			deferred.set(value, () => resolve(value));
		});
	}
</script>

<p>{count}:{await delay(count)}</p>
<button onclick={() => count++}>increment</button>
<button onclick={() => deferred.get(11)?.()}>resolve sealed</button>
<button onclick={() => deferred.get(count)?.()}>resolve latest</button>
