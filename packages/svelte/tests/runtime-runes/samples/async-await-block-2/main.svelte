<script>
	let count = $state(0);

	const queue = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil) => queue.push(() => fulfil(v)));
	}

	async function request(v) {
		const result = $derived(await push(v));
		return result + count;
	}
</script>

<button onclick={() => count++}>increment</button>
<button onclick={() => queue.shift()?.()}>resolve</button>
{#await request(count) then result}{result}{/await}
{#await await push(count) + count then result}{result}{/await}
{#await await 1 then result}{result}{/await}
