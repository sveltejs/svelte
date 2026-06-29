<script>
	/** @type {{ label?: string }} */
	let { label = 'default' } = $props();
</script>

{#snippet greeting(name)}
	<span>hello {name}</span>
{/snippet}

<div>
	{@render greeting(label)}
</div>
