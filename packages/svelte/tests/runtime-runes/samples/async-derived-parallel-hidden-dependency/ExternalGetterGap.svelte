<script module lang="ts">
	const options = {
		value: 0,
		get id() {
			this.value = 42;
			return 0;
		}
	};
</script>

<script lang="ts">
	await Promise.resolve();
	const value = options.id;
	const result = $derived(await Promise.resolve(options.value));
</script>

<output>{result}</output>
