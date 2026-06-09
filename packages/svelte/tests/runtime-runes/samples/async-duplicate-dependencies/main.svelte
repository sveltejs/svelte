<script>
	let count = $state(0);

	const queue = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil) => queue.push(() => fulfil(v)));
	}

	async function request(v) {
		const result = $derived(await push(v));
		return result + count; // read existing dependency `count` once more
	}
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => queue.shift()?.()}>resolve</button>
{await request(count)}
