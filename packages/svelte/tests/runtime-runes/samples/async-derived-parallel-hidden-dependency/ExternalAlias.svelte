<script module lang="ts">
	type MutableFunction = (() => number) & { value?: number };

	const a: { fn?: MutableFunction } = {};
	const b: { fn?: MutableFunction } = {};

	function mutate(fn: MutableFunction) {
		fn.value = 42;
	}
</script>

<script lang="ts">
	function fn() {
		return 0;
	}

	a.fn = fn;
	b.fn = fn;

	await Promise.resolve();
	mutate(a.fn);

	// Explicit aliases of the same instance function remain related through external holders.
	const result = $derived(await Promise.resolve(b.fn.value));
</script>

<output>{result}</output>
