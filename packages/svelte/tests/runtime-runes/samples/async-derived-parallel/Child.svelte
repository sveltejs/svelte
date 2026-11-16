<script lang="ts">
	let { load }: { load: (name: string, ...dependencies: unknown[]) => Promise<string> } = $props();

	// independent of each other, so they are loaded in parallel
	const a = $derived(await load('a'));
	const b = $derived(await load('b'));

	// `c` reads `b`, so it is loaded once `a` and `b` are done, in parallel with `d`
	const c = $derived(await load('c', b));
	const d = $derived(await load('d'));
</script>

<output>{a} {b} {c} {d}</output>
