<script module lang="ts">
	let reader: () => number;

	function register(_strings: TemplateStringsArray, read: () => number) {
		reader = read;
	}

	function runRegistered() {
		return Promise.resolve(reader());
	}
</script>

<script lang="ts">
	function get() {
		return value;
	}

	register`${get}`;

	await Promise.resolve();
	const value = 42;

	const result = $derived(await runRegistered());
</script>

<output>{result}</output>
