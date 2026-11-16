<script lang="ts">
	let { load }: { load: () => Promise<number> } = $props();
	const value = $derived(await load());
</script>
<p>{value}</p>
