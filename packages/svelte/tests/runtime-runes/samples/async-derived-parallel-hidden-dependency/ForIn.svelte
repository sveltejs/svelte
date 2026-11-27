<script lang="ts">
	let key = 'before';

	await Promise.resolve();

	for (key in { answer: 42 }) {
		// The loop target is a write, even without an assignment expression.
	}

	const result = $derived(await Promise.resolve(key));
</script>

<output>{result}</output>
