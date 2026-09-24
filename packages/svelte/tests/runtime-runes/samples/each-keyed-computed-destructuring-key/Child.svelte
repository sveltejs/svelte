<script>
	let { labelKey, valueKey, options } = $props();
</script>

{#each options as { [labelKey]: label, [valueKey]: value } (value)}
	<p>{label}: {value}</p>
{/each}
