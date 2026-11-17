<script lang="ts">
	let { input, load, record_write }: {
		input: number;
		load: (site: string, value: number) => Promise<number>;
		record_write: (input: number, before: number, next: number) => boolean;
	} = $props();
	let n = $state(0);
	const before = n;
	console.log(`before ${input} ${before}`);

	function increment() {
		if (record_write(input, before, n + 1)) n += 1;
	}

	const a = $derived(await load('a', input + n));
	increment();
	const b = $derived(await load('b', a + n));
</script>

{before} / {n} / {a} / {b}
