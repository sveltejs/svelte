<script>
	export let count;
</script>

<span>{count}</span>

{#if count > 1}
	<!-- this shouldn't work — we have to use <svelte:self> instead -->
	<Countdown count={count - 1}/>
{/if}