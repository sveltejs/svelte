<script>
	let { object } = $props();

	await 1;
</script>

<button onclick={() => object.count++}>clicks: {object.count}</button>
