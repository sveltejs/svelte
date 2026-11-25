<script lang="ts">
	const options: { id?: number } = {};

	await Promise.resolve();

	// we can't see into `Object.assign`, so we have to assume that it mutates `options`
	Object.assign(options, { id: 42 });

	const result = $derived(await Promise.resolve(options.id));
</script>

<output>{result}</output>
