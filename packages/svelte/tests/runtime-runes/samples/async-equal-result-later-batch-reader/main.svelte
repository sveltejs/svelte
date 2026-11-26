<script>
	let b = $state(0);
	let c = $state(0);

	/** @type {Map<string, Array<() => void>>} */
	const pending = new Map();
	let initial = true;

	/** @param {string} value */
	function f(value) {
		if (initial) return value;
		return new Promise((fulfil) => {
			if (!pending.has(value)) pending.set(value, []);
			pending.get(value)?.push(() => fulfil(value));
		});
	}

	$effect(() => {
		initial = false;
	});

	function resolve_all() {
		for (const list of pending.values()) {
			for (const fn of list.splice(0)) fn();
		}
	}

	let p = $derived(await f(b > 0 ? 'pos' : 'zero'));
</script>

<button onclick={() => (b = 1)}>b = 1</button>
<button onclick={() => ((b = 2), (c = 1))}>b = 2, c = 1</button>
<button onclick={() => pending.get('pos')?.pop()?.()}>resolve latest pos</button>
<button onclick={() => pending.get('pos')?.shift()?.()}>resolve oldest pos</button>
<button onclick={resolve_all}>resolve all</button>

<p>{p}</p>
{#if true}<span>{b}</span>{/if}
<i>{await f('c' + c)}</i>
