<script>
	export let value;

	function uppercase(event) {
		event.target.value = event.target.value.toUpperCase()
	}
</script>

<input on:input={uppercase} bind:value>
<p>{value}</p>
