<svelte:options customRenderer="../../../../renderer-shared.ts" />

<script>
	let { item } = $props();
</script>

<b>{item}</b>
