<script lang="ts">
	let value = 0;

	await Promise.resolve();

	$effect.pre(() => {
		value = 42;
	});

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
