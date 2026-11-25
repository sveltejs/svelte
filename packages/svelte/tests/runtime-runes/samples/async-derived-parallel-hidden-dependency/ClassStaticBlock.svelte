<script lang="ts">
	let value = 0;

	await Promise.resolve();

	// static blocks run when the class is created
	class Config {
		static {
			value = 42;
		}
	}

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
