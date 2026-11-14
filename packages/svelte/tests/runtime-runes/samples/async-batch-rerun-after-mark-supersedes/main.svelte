<script>
	let a = $state(0);
	const pending = [];

	function push(key, value) {
		if (value === 0 || value === '0/0') return value;
		console.log(`${key} ${value}`);
		return new Promise((resolve) => pending.push({ key, value, resolve }));
	}

	function resolve(key, last = false) {
		const matching = pending.filter((d) => d.key === key);
		const entry = last ? matching.at(-1) : matching[0];
		if (!entry) return;
		pending.splice(pending.indexOf(entry), 1);
		entry.resolve(entry.value);
	}

	let r1 = $derived(await push('r1', a));
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => resolve('r1')}>shift r1</button>
<button onclick={() => resolve('r2')}>shift r2</button>
<button onclick={() => resolve('r2', true)}>pop r2</button>

<p>{await push('r2', `${a}/${r1}`)}</p>
