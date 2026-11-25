<script lang="ts">
	let x = 0;
	const receiver = {
		write() {
			x = 42;
		}
	};

	await Promise.resolve();
	receiver.write();

	// The result reads the captured value, not the receiver's identity.
	const result = $derived(await Promise.resolve(x));
</script>

<output>{result}</output>
