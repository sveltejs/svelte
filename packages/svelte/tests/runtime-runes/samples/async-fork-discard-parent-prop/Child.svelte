<script lang="ts">
	let { a, load }: { a: number; load: (value: number) => Promise<number> } = $props();

	const b = $derived(await load(a + 10));
</script>

<p>{a} {b}</p>
