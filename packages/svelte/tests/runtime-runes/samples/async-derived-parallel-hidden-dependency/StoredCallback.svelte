<script lang="ts">
	const handlers: Array<() => number> = [];
	handlers.push(() => value);

	await Promise.resolve();
	const value = await Promise.resolve(42);

	// `handlers` holds a callback that reads `value`
	const result = $derived(await Promise.resolve(handlers[0]()));
</script>

<output>{result}</output>
