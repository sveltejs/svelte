<script>
	let foreign = $state(0);
	const input = Promise.resolve({ pending: new Promise(() => {}) });

	setTimeout(() => {
		foreign += 1;
	});
</script>

{#await (await input).pending}
	<p>pending</p>
{/await}

<p>{foreign}</p>
