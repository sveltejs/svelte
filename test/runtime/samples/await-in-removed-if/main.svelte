<script>
	export let promise;
	export let condition = true;
</script>

{#if condition}
	{#await promise then _}hello{/await}
{/if}