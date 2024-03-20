<script>
	let { count: definedCount = $bindable() } = $props();
</script>

<button on:click={() => definedCount++}>{definedCount}</button>
