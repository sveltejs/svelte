<script>
	let count = $state(0);
	const parity = $derived.by(() => {
		console.log(count);
		return count % 2;
	});
	const pending = new Map();

	function delay(name, value) {
		if (value === 0) return value;
		return new Promise(resolve => pending.set(name, () => resolve(value)));
	}
</script>

<button onclick={() => count += 2}>update</button>
<button onclick={() => pending.get('a')?.()}>resolve a</button>
<button onclick={() => pending.get('b')?.()}>resolve b</button>

<p>{await delay('a', count)}:{parity}</p>
{#if await delay('b', count)}
	{#if parity}<p>odd</p>{/if}
{/if}
