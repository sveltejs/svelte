<script>
	export let options = [];
	export let value = "";
	export let label = "";
</script>

<select bind:value {...$$restProps}>
	{#each options as option}
		<option>{option}</option>
	{/each}
</select>
<p>{label}</p>
