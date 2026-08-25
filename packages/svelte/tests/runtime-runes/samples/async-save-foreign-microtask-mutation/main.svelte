<script>
	let foreign = $state(0);

	const items = Promise.resolve([1, 2, 3]);

	// registered before the derived, so it runs first when `items` settles.
	// Two nested microtasks land the write in the window between the compiled
	// continuation restoring the derived's context and svelte's queued unset
	items.then(() => {
		queueMicrotask(() => {
			queueMicrotask(() => {
				foreign += 1;
			});
		});
	});

	// `.length` follows the await, so the compiler pickles it via `$.save`
	const length = $derived((await items).length);
</script>

<p>{length} {foreign}</p>
