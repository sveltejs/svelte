<script>
	let foreign = $state(0);

	const items = Promise.resolve([1, 2, 3]);
	const one = Promise.resolve(1);

	// lands the write while the derived is suspended on `await one`, after the
	// context restored for `.length` — in production that await has no dev hook
	items.then(() => {
		queueMicrotask(() => {
			queueMicrotask(() => {
				foreign += 1;
			});
		});
	});

	const total = $derived((await items).length + (await one));
</script>

<p>{total} {foreign}</p>
