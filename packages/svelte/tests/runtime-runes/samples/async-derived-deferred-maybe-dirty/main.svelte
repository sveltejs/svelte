<script>
	let a = $state(0);
	let b = $state(0);
	const sum = $derived(a + b);
	const doubled = $derived(sum * 2);
	const pending = new Map();

	function delay(name, value) {
		if (value === 0) return value;
		return new Promise(resolve => pending.set(name, () => resolve(value)));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => pending.get('a')?.()}>resolve a</button>
<button onclick={() => pending.get('b')?.()}>resolve b</button>

<p>{await delay('a', a)}:{doubled}</p>
<p>{await delay('b', b)}</p>
{#if b && doubled}<span>ready</span>{/if}
