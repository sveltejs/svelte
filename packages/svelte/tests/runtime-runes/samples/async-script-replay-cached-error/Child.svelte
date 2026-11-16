<script lang="ts">
	let { input, load }: { input: number; load: (value: number) => Promise<number> } = $props();
	const value = $derived(await load(input));
</script>

<p>{value}</p>
