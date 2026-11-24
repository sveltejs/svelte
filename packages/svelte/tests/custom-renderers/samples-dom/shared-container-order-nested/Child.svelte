<svelte:options customRenderer="../../_renderer-a.ts" />

<script lang="ts">
	import Grandchild from './Grandchild.svelte';

	let { item }: { item: string } = $props();
</script>

<Grandchild {item} />
