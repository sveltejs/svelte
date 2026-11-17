<script lang="ts">
	let { shared, increment, load, invoke }: {
		shared: { input: number; count: number };
		increment: () => number;
		load: (site: string, input: number) => Promise<number>;
		invoke: (callback: () => number) => number;
	} = $props();

	const before = shared.count;
	console.log(`before ${before}`);
	const a = $derived(await load('a', shared.input));
	const written = invoke(increment);
	const b = $derived(await load('b', a + written));
</script>

{before} / {written} / {a} / {b} / {shared.count}
