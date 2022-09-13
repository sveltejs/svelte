<script>
	let objArray = [{ bar: {foo: '1', id: 0, innerValue: "test"} }, { bar: {foo: '2', id:1, innerValue: "Somethin"} }]
</script>

{#each objArray as { bar: { id, ...rest } } (id)}
	<input bind:value={rest.innerValue} type="text" placeholder={rest.foo}/>
	<br/>
{/each}
