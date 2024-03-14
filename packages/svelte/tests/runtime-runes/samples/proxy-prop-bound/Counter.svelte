<script>
	/** @type {{ object: { count: number }}} */
	let { object } = $props.bindable();
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
