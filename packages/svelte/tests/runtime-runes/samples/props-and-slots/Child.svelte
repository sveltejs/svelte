<script>
	const props = $props();
</script>

<p>{Object.keys(props)}</p>

{#if $$slots.foo}
	<p>foo exists</p>
{/if}
