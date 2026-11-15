<script>
	let { x, load } = $props();
	let value = $derived(await load(x));
</script>

<span>{value}</span>
