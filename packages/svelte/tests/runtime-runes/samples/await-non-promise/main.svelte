<script>
	let count = $state(43);
</script>

{#await count}
	loading
{:then count}
	{count}
{/await}