<svelte:options customRenderer="../../_renderer-b.ts" />

<script lang="ts">
	let { item }: { item: string } = $props();
</script>

{item}
