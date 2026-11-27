<script module lang="ts">
	type MutableFunction = (() => number) & { value?: number };

	const holder: { fn?: MutableFunction } = {};

	function mutate(fn: MutableFunction) {
		fn.value = 42;
	}
</script>

<script lang="ts">
	function fn() {
		return 0;
	}

	holder.fn = fn;

	await Promise.resolve();
	mutate(fn);

	// Functions can escape and be mutated through aliases, just like other objects.
	const result = $derived(await Promise.resolve(holder.fn.value));
</script>

<output>{result}</output>
