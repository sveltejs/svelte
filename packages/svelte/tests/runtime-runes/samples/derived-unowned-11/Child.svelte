<script>
	let { value = $bindable() } = $props()
</script>

<button onclick={() => value = 'a'}>change</button>
