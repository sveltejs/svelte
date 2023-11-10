<script>
	export let cats;

	function someCheck() {
		
	}
</script>

{#each cats as cat (cat.name)}
	<input type="checkbox" bind:checked={cat.checked} on:change="{someCheck}">
{/each}