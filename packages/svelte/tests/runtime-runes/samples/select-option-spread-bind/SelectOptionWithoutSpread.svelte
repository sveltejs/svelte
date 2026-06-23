<script>
	let { value = $bindable(), options } = $props();
</script>

<select bind:value>
	{#each options as { value, label }}
		<option {value}>{label}</option>
	{/each}
</select>
