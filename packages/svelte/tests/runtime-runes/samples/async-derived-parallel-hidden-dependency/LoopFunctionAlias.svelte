<script lang="ts">
	function readA() {
		return a;
	}

	let get: () => number;

	for (get of [readA]) {
		// The loop transfers the callback before the first await.
	}

	const a = $derived(await Promise.resolve(42));
	const b = $derived(await get());
</script>

<output>{a}/{b}</output>
