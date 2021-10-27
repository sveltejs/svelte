<script>
	export let arr;
</script>

{#each arr as {p, ...rest} (rest.id)}
	<input bind:value={rest.val} placeholder={p}/>
	{JSON.stringify(rest)}
	<br>
{/each}
