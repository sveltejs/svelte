<script>
	let values = $state([1]);

	const queue = [];

	function push(v) {
		if (v === 1) return v;

		const p = Promise.withResolvers();
		queue.push(() => p.resolve(v));
		return p.promise;
	}

	function shift() {
		const fn = queue.shift();
		if (fn) fn();
	}

	function addValue() {
		values = [...values, values.length + 1];
	}
</script>

<button onclick={addValue}>add</button>
<button onclick={shift}>shift</button>

{#each values as v}
	<p>{await push(v)}</p>
{/each}
