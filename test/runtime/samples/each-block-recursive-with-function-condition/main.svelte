<script>
let a = () => true;
export let data = [{ foo: [{ foo: [{bar: "one"}, {bar: "two"}] }] }];
</script>

{#each data as datum}
	{#if datum.foo && a()}
		<p>OK</p>
		<svelte:self data={datum.foo}/>
	{:else}
		<pre>{datum.bar}</pre>
	{/if}
{/each}
