<script lang="ts">
	let value = 0;
	const object = {
		get current() {
			value = 42;
			return value;
		}
	};

	await Promise.resolve();
	const current = object.current;

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
