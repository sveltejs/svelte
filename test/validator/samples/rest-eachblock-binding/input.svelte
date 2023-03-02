<script>
	let objArray = [{foo: '1', id: 0, innerValue: "test"}, {foo: '2', id:1, innerValue: "Somethin"}]
</script>

{#each objArray as { id, ...rest } (id)}
	<input bind:value={rest.innerValue} type="text" placeholder={rest.foo}/>
	<br/>
{/each}
