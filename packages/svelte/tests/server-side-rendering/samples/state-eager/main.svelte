<script>
	let props = $props();
	const value = $derived(props.number ?? 0);
</script>

<div>value={value}</div>
<div>eager={$state.eager(value)}</div>
