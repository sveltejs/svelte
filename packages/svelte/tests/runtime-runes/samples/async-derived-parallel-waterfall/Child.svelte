<script lang="ts">
	let { load }: { load: (name: string, ...dependencies: unknown[]) => Promise<string> } = $props();

	const a = $derived(await load('a'));
	// reads `a`, so it is loaded once `a` is done
	const c = $derived(await load('c', a));
	// independent of `a` and `c`, so it is loaded right away, but only awaited after `c`
	const b = $derived(await load('b'));
</script>

<output>{a} {b} {c}</output>
