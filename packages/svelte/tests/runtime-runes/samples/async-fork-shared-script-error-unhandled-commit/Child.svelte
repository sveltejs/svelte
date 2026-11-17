<script lang="ts">
	let { load }: { load: () => Promise<number> } = $props();

	const value = $derived(await load());
	console.log(`continued ${value}`);
</script>

<p>{value}</p>
