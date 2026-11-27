<script lang="ts">
	let value = 0;
	const object = {
		valueOf() {
			value = 42;
			return 0;
		}
	};

	await Promise.resolve();
	const coerced = +object;

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
