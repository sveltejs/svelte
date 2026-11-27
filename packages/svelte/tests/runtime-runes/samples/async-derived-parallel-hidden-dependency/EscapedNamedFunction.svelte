<script module lang="ts">
	let reader: (register: boolean) => number;

	function registerFn(fn: (register: boolean) => number) {
		reader = fn;
	}

	function runRegistered() {
		return Promise.resolve(reader(false));
	}
</script>

<script lang="ts">
	const outer = function self(register: boolean): number {
		if (register) {
			registerFn(self);
			return 0;
		}

		return value;
	};

	outer(true);

	await Promise.resolve();
	const value = 42;

	// The function can escape through its own name rather than its outer binding.
	const result = $derived(await runRegistered());
</script>

<output>{result}</output>
