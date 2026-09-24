<svelte:options customRenderer={null} />

<script>
	let { message } = $props();
</script>

<div>
	<span>{message}</span>
</div>
