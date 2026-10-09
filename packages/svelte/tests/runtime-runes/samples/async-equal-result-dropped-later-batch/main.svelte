<script>
	let b = $state(0);
	let c = $state(0);

	/** @type {Map<string, Array<() => void>>} */
	const pending = new Map();

	/** @param {string} value */
	function f(value) {
		return new Promise((fulfil) => {
			if (!pending.has(value)) pending.set(value, []);
			pending.get(value)?.push(() => fulfil(value));
		});
	}

	function resolve_all() {
		for (const list of pending.values()) {
			for (const fn of list.splice(0)) fn();
		}
	}
</script>

<button onclick={() => (b = 1)}>b = 1</button>
<button onclick={() => ((b = 2), (c = 1))}>b = 2, c = 1</button>
<button onclick={() => pending.get('pos')?.pop()?.()}>resolve latest pos</button>
<button onclick={() => pending.get('pos')?.shift()?.()}>resolve oldest pos</button>
<button onclick={resolve_all}>resolve all</button>

<svelte:boundary>
	<p>{await f(b > 0 ? 'pos' : 'zero')}</p>
	<span>{b}</span>
	<i>{await f('c' + c)}</i>
	{#snippet pending()}{/snippet}
</svelte:boundary>
