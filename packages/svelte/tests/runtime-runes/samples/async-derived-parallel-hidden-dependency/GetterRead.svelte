<script lang="ts">
	let value = 0;
	const object = {
		get current() {
			return value;
		}
	};

	await Promise.resolve();
	value = 42;

	// Reading a local property can invoke code, not just read the receiver's identity.
	const result = $derived(await Promise.resolve(object.current));
</script>

<output>{result}</output>
