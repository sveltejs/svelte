<svelte:options customRenderer={null} />

<script lang="ts">
	let { item }: { item: string } = $props();
</script>

{item}
