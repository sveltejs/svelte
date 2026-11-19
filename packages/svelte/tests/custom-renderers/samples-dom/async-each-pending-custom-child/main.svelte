<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let values = $state([1]);

	const queue = [];

	function push(v) {
		if (v === 1) return v;

		return new Promise((resolve) => {
			queue.push(() => resolve(v));
		});
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
	<Child message={`item ${v}`}></Child>
{/each}
