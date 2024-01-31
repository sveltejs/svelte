<script>
	let { count: definedCount } = $props();
</script>

<button on:click={() => definedCount++}>{definedCount}</button>
