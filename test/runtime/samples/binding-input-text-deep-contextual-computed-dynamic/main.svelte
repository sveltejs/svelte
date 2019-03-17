<script>
	export let objects;
	export let prop;
</script>

{#each objects as obj}
	<input bind:value={obj[prop]}>
	<pre>{JSON.stringify(obj)}</pre>
{/each}