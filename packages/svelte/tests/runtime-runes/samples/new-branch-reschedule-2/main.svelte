<script>
	let active = $state(false);
	let panelWidth = $state(null);
	let counter = $state(0);

	const store = {
		get active() { return active; },
		open() { active = true; },
		close() { active = false; },
		// This getter lazily writes $state on first read
		get panelWidth() {
			if (panelWidth === null) panelWidth = 42;

			$effect(() => {
				console.log('effect ran');
			});

			return panelWidth;
		}
	};
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
