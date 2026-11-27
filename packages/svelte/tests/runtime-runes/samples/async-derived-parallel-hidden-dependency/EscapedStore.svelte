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
	function subscribe(run: (value: number) => void) {
		run(value);
		return () => {};
	}

	const store = { subscribe };

	function get() {
		return $store;
	}

	register(get);

	await Promise.resolve();
	const value = 42;

	// Follow the escaped store subscription through its named subscribe function.
	const result = $derived(await runRegistered());
</script>

<output>{result}</output>
