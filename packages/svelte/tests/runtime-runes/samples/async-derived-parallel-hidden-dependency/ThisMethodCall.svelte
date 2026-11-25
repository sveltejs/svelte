<script lang="ts">
	let total = 0;

	const counter = {
		increment() {
			this.add(42);
		},
		add(n: number) {
			total += n;
		}
	};

	await Promise.resolve();

	counter.increment();

	const result = $derived(await Promise.resolve(total));
</script>

<output>{result}</output>
