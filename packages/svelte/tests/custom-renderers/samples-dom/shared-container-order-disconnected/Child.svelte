<svelte:options customRenderer="../../_renderer.ts" />

<script lang="ts">
	let { item }: { item: string } = $props();
</script>

{item}
