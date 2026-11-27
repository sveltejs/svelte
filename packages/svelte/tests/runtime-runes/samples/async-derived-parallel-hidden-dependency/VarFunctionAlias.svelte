<script lang="ts">
	function readA() {
		return a;
	}

	var get = readA;
	var get;

	const a = await Promise.resolve(42);
	const b = $derived(await get());
</script>

<output>{a}/{b}</output>
