<script module>
	let active = $state(false);
	let panelWidth = $state(null);

	const store = {
		get active() { return active; },
		open() { active = true; },
		close() { active = false; },
		// This getter lazily writes $state on first read
		get panelWidth() {
			if (panelWidth === null) panelWidth = 42;
			return panelWidth;
		}
	};
</script>

<script>
	let counter = $state(0);
</script>

<button onclick={() => store.open()}>Open</button>
<button onclick={() => store.close()}>Close</button>
<button onclick={() => counter++}>{counter}</button>

<div>
	{#if store.active}
		open (width: {store.panelWidth})
	{:else}
		closed
	{/if}
</div>