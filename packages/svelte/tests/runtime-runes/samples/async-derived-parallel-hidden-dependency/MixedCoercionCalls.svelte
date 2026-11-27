<script lang="ts">
	let x = 0;
	const object = {
		valueOf() {
			x = 42;
			return 21;
		}
	};

	function twice(n: number) {
		return n * 2;
	}

	await Promise.resolve();
	const primitive = twice(21);
	// Reusing the same helper with an object must not reuse the primitive call's effect proof.
	const coerced = twice(object as unknown as number);
	const result = $derived(await Promise.resolve(x));
</script>

<output>{primitive}/{coerced}/{result}</output>
