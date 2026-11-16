<script lang="ts">
	let { input, load }: { input: number; load: (site: string, value: number) => Promise<number> } = $props();
	const a = $derived(await load('a', input));
	const snapshot = a;
	const b = $derived(await load('b', a + snapshot));
</script>

<p>{a}/{snapshot}/{b}</p>
