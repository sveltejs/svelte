<script>
	let a = $state(0);
	let b = $state(0);
	let pend = false;

	const pending = new Map();

	function delay(key, value) {
		if (!pend) return value;
		return new Promise((resolve) => pending.set(key, () => resolve(value)));
	}

	function resolve(key) {
		pending.get(key)();
		pending.delete(key);
	}

	const k = $derived(b === 0 ? await delay(`a${a}`, a) : 'B');
</script>

<p>{await delay(`b${b}`, b)}</p>

{#key k}
	<p>{k}</p>
{/key}

<button onclick={() => { pend = true; a = 1; }}>a</button>
<button onclick={() => { pend = true; b = 1; }}>b</button>
<button onclick={() => resolve('a1')}>resolve a1</button>
<button onclick={() => resolve('b1')}>resolve b1</button>
