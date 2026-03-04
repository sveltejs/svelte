<script>
	await Promise.resolve();
	let { value = $bindable("test") } = $props();
</script>

<button onclick={() => value = 'updated'}>update</button>
{value}

