<script lang="ts">
	let { load }: { load: (name: string, ...dependencies: unknown[]) => Promise<string> } = $props();

	// independent of each other, so they are loaded in parallel
	const a = $derived(await load('a'));
	const b = $derived(await load('b'));
</script>

<output>{a} {b}</output>
