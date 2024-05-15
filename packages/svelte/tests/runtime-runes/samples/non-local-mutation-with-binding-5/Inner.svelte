<script>
	let { object = $bindable() } = $props();
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
