<script>
	let { condition } = $props();
</script>

{#if true}
	<p>foo</p>
{:else}
	<p>bar</p>
{/if}
