<script lang="ts">
	let value = 0;

	function change() {
		value = 42;
	}

	await Promise.resolve();
	change`update`;

	const result = $derived(await Promise.resolve(value));
</script>

<output>{result}</output>
