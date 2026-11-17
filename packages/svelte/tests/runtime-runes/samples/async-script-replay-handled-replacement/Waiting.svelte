<script lang="ts">
	let { wait }: { wait: () => Promise<string> } = $props();
	const value = $derived(await wait());
</script>
<span>{value}</span>
