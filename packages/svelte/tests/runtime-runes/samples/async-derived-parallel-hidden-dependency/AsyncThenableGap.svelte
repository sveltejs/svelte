<script lang="ts">
	let x = 0;
	const task = {
		then(resolve: (value: number) => void) {
			x = 42;
			resolve(1);
		}
	};

	async function f() {
		return task;
	}

	const a = await f();
	const result = $derived(await Promise.resolve(x));
</script>

<output>{result}</output>
