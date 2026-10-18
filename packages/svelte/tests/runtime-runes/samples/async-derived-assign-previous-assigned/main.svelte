<script>
	let s = $state(0);
	let u = $state(0);
	let w = $state(0);
	let d = $derived(s * 10);

	const pending = new Map();

	function delay(name, value) {
		if (!value) return value;
		return new Promise((resolve) => pending.set(name, () => resolve(value)));
	}

	function probe(value) {
		console.log(`probe ${value}`);
		return value;
	}
</script>

<button onclick={() => (d = 5)}>assign</button>
<button onclick={() => u++}>u</button>
<button
	onclick={() => {
		d = 99;
		w++;
	}}>d</button
>
<button onclick={() => pending.get('b')?.()}>resolve b</button>
<button onclick={() => pending.get('c')?.()}>resolve c</button>

<p>{await delay('c', w)}</p>
<span>{d}</span>

{#if await delay('b', u)}
	<i>{await probe(d)}</i>
{/if}
