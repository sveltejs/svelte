<script lang="ts">
	const value = { count: 0 };
	const holder: { current?: typeof value } = {};
	holder.current = value;

	await Promise.resolve();
	value.count = 42;

	const result = $derived(await Promise.resolve(holder.current?.count));
</script>

<output>{result}</output>
