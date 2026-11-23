<script>
	let base = $state([1, 2]);
	let extraKey = $state(/** @type {number | null} */ (null));
	let tickA = $state(0);
	let tickB = $state(0);

	// Two independent sources so the batches touch disjoint source sets
	// and are not merged.
	const items = $derived(extraKey === null ? base : [...base, extraKey]);

	/** @type {((value: string) => void) | undefined} */
	let resolveB;

	/**
	 * @param {string} name
	 * @param {number} n
	 */
	const gate = (name, n) =>
		n === 0
			? Promise.resolve(`${name}0`)
			: new Promise((r) => {
					if (name === 'B') resolveB = r;
				});

	const a = $derived(await gate('A', tickA));
	const b = $derived(await gate('B', tickB));

	function startA() {
		extraKey = 9;
		tickA = 1;
	}

	function startB() {
		base = [];
		tickB = 1;
	}

	function settleB() {
		resolveB?.('B1');
	}
</script>

<button onclick={startA}>startA</button>
<button onclick={startB}>startB</button>
<button onclick={settleB}>settleB</button>

<p>{a}/{b}</p>

<!-- Sole child so the each block is controlled and the fast path applies. -->
<div>
	{#each items as item (item)}
		<span>{item}</span>
	{/each}
</div>
