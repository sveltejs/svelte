<script lang="ts">
	const filters = { status: 'open' };
	const view = { filters };

	await Promise.resolve();

	// mutates `filters`
	view.filters.status = 'mine';

	const result = $derived(await Promise.resolve(filters.status));
</script>

<output>{result}</output>
