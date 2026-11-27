<script lang="ts">
	let x = 0;

	function invoke(callback: () => void) {
		callback();
	}

	function writeX() {
		x = 42;
	}

	await Promise.resolve();
	invoke(writeX);

	const result = $derived(await Promise.resolve(x));
</script>

<output>{result}</output>
