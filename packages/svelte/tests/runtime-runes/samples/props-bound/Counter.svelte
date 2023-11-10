<script>
	let { count } = $props();
</script>

<button on:click={() => count++}>{count}</button>
