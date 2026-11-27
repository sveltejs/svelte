<script lang="ts">
	let value = 0;

	await Promise.resolve();

	for (value of [42]) {
		// The loop target is a write, even without an assignment expression.
	}

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
