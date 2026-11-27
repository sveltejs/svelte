<script lang="ts">
	function readA() {
		return a;
	}

	let get: () => number;

	try {
		throw readA;
	} catch (callback) {
		get = callback as () => number;
	}

	const a = await Promise.resolve(42);
	const b = $derived(await get());
</script>

<output>{a}/{b}</output>
