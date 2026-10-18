<script>
	let s = $state(0);
	let u = $state(0);
	let w = $state(0);
	let show = $state(true);
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

<button onclick={() => s++}>s</button>
<button onclick={() => u++}>u</button>
<button
	onclick={() => {
		s++;
		d;
		w++;
	}}>d</button
>
<button onclick={() => pending.get('a')?.()}>resolve a</button>
<button onclick={() => pending.get('b')?.()}>resolve b</button>
<button onclick={() => pending.get('c')?.()}>resolve c</button>

<p>{await delay('a', s)}</p>
<p>{await delay('c', w)}</p>
<!-- inside a branch, so that B's traversal doesn't reach (and stash) the effect reading `d` -->
{#if show}
	<span>{d}</span>
{/if}

{#if await delay('b', u)}
	<i>{await probe(d)}</i>
{/if}
