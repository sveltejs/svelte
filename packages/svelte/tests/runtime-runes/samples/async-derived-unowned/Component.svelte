<script>
	let { double } = $props();
	double; // derived is first read outside an active_reaction
</script>

<p>{double}</p>
