<script module lang="ts">
	let reader: () => number;

	class Register {
		constructor(read: () => number) {
			reader = read;
		}
	}

	function runRegistered() {
		return Promise.resolve(reader());
	}
</script>

<script lang="ts">
	function get() {
		return value;
	}

	new Register(get);

	await Promise.resolve();
	const value = 42;

	const result = $derived(await runRegistered());
</script>

<output>{result}</output>
