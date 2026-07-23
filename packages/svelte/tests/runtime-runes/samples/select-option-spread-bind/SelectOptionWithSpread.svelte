<script>
	let { value = $bindable(), options } = $props();
</script>

<select bind:value>
	{#each options as { value, label, ...restprops }}
		<option {value} {...restprops}>{label}</option>
	{/each}
</select>
