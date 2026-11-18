<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let y = $state(0);
	let d = $derived(await push(`d${a + b + c}`, a + b + c));

	let deferreds = [];

	function push(key, v) {
		// initial values resolve right away
		if (v === 0) return v;

		const d = Promise.withResolvers();
		deferreds.push({ key, v, d });
		return d.promise;
	}

	function shift(key) {
		const i = deferreds.findIndex((d) => d.key === key);
		if (i === -1) return;
		const [{ v, d }] = deferreds.splice(i, 1);
		d.resolve(v);
	}
</script>

<button onclick={() => (a = 1)}>a</button>
<button onclick={() => (b = 10)}>b</button>
<button onclick={() => (c = 100)}>c</button>
<button onclick={() => y++}>y</button>

{#each ['d1', 'd10', 'd100', 'b10', 'c100', 'd111'] as key}
	<button onclick={() => shift(key)}>{key}</button>
{/each}

<p>{await push(`a${a}`, a)} {await push(`b${b}`, b)} {await push(`c${c}`, c)}</p>
<p>y: {y}, d: {d}</p>
