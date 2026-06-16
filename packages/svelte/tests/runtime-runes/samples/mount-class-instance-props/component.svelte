<script>
	let { value = $bindable() } = $props();
</script>

<button onclick={() => value++}>{value}</button>
