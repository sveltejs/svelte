<script>
	/** @type {{ object: { count: number }}} */
	let { object } = $props();
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
