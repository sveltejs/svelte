<script lang="ts">
	const value = { count: 0 };

	function change(target = value) {
		target.count = 42;
	}

	await Promise.resolve();
	change();

	const result = $derived(await Promise.resolve(value.count));
</script>

<output>{result}</output>
