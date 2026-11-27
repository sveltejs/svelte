<script lang="ts">
	let x = 0;
	const thenable = {
		then(resolve: (value: number) => void) {
			x = 42;
			resolve(1);
		}
	};

	const a = await thenable;
	// Awaiting the thenable invokes its local method before this value can be read.
	const result = $derived(await Promise.resolve(x));
</script>

<output>{result}</output>
