<script>
	let x = $state(0);
	let s = $state(5);

	const pending = new Map();

	function delay(name, value, initial) {
		if (value === initial) return value;
		return new Promise((resolve) => pending.set(name, () => resolve(value)));
	}

	const t = $derived(await delay('a', x, 0));
	const d = $derived(t ? 0 : s);
</script>

<button onclick={() => x++}>x</button>
<button onclick={() => (s = 0)}>s</button>
<button onclick={() => pending.get('a')?.()}>resolve a</button>
<button onclick={() => pending.get('b')?.()}>resolve b</button>

{#if d >= 0}
	<p>{t}:{d}</p>
{/if}

<p>{await delay('b', s, 5)}</p>
