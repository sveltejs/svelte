<script>
	/** @type {{ object?: { count: number }, non_bindable?: { count: number }}} */
	let { object = $bindable({ count: 0 }), non_bindable = { count: 0 } } = $props();
</script>

<button onclick={() => (object.count += 1)}>
	mutate: {object.count}
</button>

<button onclick={() => (object = { count: object.count + 1 })}>
	reassign: {object.count}
</button>

<button onclick={() => (non_bindable.count += 1)}>
	mutate: {non_bindable.count}
</button>

<button onclick={() => (non_bindable = { count: non_bindable.count + 1 })}>
	reassign: {non_bindable.count}
</button>
