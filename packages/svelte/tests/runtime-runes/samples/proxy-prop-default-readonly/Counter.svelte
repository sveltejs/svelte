<script>
	/** @type {{ object?: { count: number }}} */
	let { object = { count: 0 } } = $props();
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
