<script>
	let count = $state(-1);
	let payload = $state(false);
	let updated = $state(false);

	$effect(() => {
		if (payload) {
			updated = true;
		}
	});

	function update() {
		count = 0;
		queueMicrotask(() => {
			payload = true;
		});
	}
</script>

<button onclick={update}>update</button>

<p>{updated}</p>

<svelte:boundary>
	{await new Promise(() => {})}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
