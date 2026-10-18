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

	const slows = [];

	function slow(value) {
		console.log(`slow ${value}`);
		return new Promise((resolve) => slows.push(() => resolve(value)));
	}
</script>

<button onclick={() => s++}>s</button>
<button onclick={() => u++}>u</button>
<button
	onclick={() => {
		d = 99;
		w++;
	}}>d</button
>
<button onclick={() => pending.get('a')?.()}>resolve a</button>
<button onclick={() => pending.get('b')?.()}>resolve b</button>
<button onclick={() => pending.get('c')?.()}>resolve c</button>
<button onclick={() => slows.splice(0).forEach((r) => r())}>resolve slow</button>

<p>{await delay('a', s)}</p>
<p>{await delay('c', w)}</p>
<span>{d}</span>

{#if await delay('b', u)}
	<i>{await slow(d)}</i>
{/if}
