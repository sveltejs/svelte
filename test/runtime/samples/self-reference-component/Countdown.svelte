<script>
	export let count;
</script>

{#if count > 0}
	<slot count={count-1}></slot>
{/if}