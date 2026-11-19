<script lang="ts">
	let { load }: { load: (name: string, ...dependencies: unknown[]) => Promise<string> } = $props();

	// independent of each other, so they are loaded in parallel
	const a = $derived(await load('a'));
	const b = $derived(await load('b'));

	// `c` reads `b`, so it is loaded once `a` and `b` are done
	const c = $derived(await load('c', b));
	const upper = $derived(c.toUpperCase());

	// `d` is independent of everything before it, so it is loaded right away,
	// despite not being next to the other independent deriveds
	const d = $derived(await load('d'));
</script>

<output>{a} {b} {c} {upper} {d}</output>
