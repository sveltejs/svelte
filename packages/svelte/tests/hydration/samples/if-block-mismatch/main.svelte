<script>
	let { condition } = $props();
</script>

{#if condition}
	<p>foo</p>
{:else}
	<p>bar</p>
{/if}
