<script>
	/** @type {{ shared: { count: number }, notshared: { count: number } }} */
	let { shared = $bindable(), notshared } = $props();
</script>

<button onclick={() => shared.count += 1}>
	clicks: {shared.count}
</button>

<button onclick={() => notshared.count += 1}>
	clicks: {notshared.count}
</button>
