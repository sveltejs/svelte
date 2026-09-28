<script>
	let foreign = $state(0);
	const input = Promise.resolve({
		get value() {
			throw new Error('boom');
		}
	});

	input.then(() => {
		queueMicrotask(() => {
			queueMicrotask(() => {
				foreign += 1;
			});
		});
	});
</script>

<svelte:boundary onerror={() => {}}>
	{#snippet failed()}
		<p>failed</p>
	{/snippet}

	<p>{(await input).value}</p>
</svelte:boundary>

<p>{foreign}</p>
