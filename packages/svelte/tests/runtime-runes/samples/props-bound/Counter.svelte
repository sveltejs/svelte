<script>
	let { count = $bindable() } = $props();
</script>

<button on:click={() => count++}>{count}</button>
