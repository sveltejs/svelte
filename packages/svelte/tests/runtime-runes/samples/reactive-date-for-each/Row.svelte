<script>
	let { event, clock } = $props();
	const age = $derived(clock.compactAgo(event.timestamp));
	const label = $derived(`#${event.id}`);
</script>

<span>{label} {age}</span>

