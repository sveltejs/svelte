<svelte:options customRenderer={null} />

<script>
	let { message } = $props();
</script>

<i>{message}</i>
