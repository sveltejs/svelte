<script>
	export let visible;
</script>

{#if visible}
	{JSON.stringify($$props)} {JSON.stringify($$restProps)}
{/if}
