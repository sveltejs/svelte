<script module lang="ts">
	let read: () => number;

	function register(fn: () => number) {
		read = fn;
	}

	function runRegistered() {
		return Promise.resolve(read());
	}
</script>

<script lang="ts">
	function get() {
		return value;
	}

	register(get);

	await Promise.resolve();
	const value = 42;

	// The escaped callback captures a live binding, even when its eventual value is statically known.
	const result = $derived(await runRegistered());
</script>

<output>{result}</output>
