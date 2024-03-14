<script>
	/** @type {{ object?: { count: number }}} */
	let { object = { count: 0 } } = $props.bindable();
</script>

<button onclick={() => object.count += 1}>
	mutate: {object.count}
</button>

<button onclick={() => object = { count: object.count + 1 } }>
	reassign: {object.count}
</button>
