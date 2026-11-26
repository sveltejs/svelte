<svelte:options customRenderer="../../../../renderer-b.ts" />

<script>
	let { message } = $props();
</script>

<b>{message}</b>
