<script>
	let foreign = $state(0);

	const items = Promise.resolve([1, 2, 3]);

	// resolves after the write below, so the outer `await` is still suspended when it lands
	function plus_one(n) {
		return new Promise((resolve) => setTimeout(() => resolve(n + 1), 10));
	}

	setTimeout(() => {
		foreign += 1;
	});

	// the inner `await` restores the context for `.length`, the outer one must end it when it suspends —
	// in production that await has no dev hook
	const total = $derived(await plus_one((await items).length));
</script>

<p>{total} {foreign}</p>
