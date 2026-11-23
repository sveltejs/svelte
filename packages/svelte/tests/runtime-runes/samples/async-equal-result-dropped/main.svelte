<script>
	let b = $state(0);

	/** @type {Map<string, Array<() => void>>} */
	const pending = new Map();

	/** @param {string} value */
	function delay(value) {
		return new Promise((fulfil) => {
			if (!pending.has(value)) pending.set(value, []);
			pending.get(value)?.push(() => fulfil(value));
		});
	}

	/** @param {string} value */
	function resolve(value) {
		pending.get(value)?.shift()?.();
	}

	function resolve_all() {
		for (const list of pending.values()) {
			for (const fn of list.splice(0)) fn();
		}
	}
</script>

<button onclick={() => (b = 2)}>b = 2</button>
<button onclick={() => (b = 0)}>b = 0</button>
<button onclick={() => resolve('k3')}>resolve k3</button>
<button onclick={() => resolve('k0')}>resolve k0</button>
<button onclick={resolve_all}>resolve all</button>

<svelte:boundary>
	<b>{await delay('k' + (0 + b))}</b><b>{await delay('k' + (1 + b))}</b>
	{#snippet pending()}{/snippet}
</svelte:boundary>
