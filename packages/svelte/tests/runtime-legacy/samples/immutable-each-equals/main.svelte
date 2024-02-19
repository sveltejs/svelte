<script>
	let items = [{id:1,value: "test"}]
	const update = () => {
		const clone = items.slice();
		clone[0].value += " !!!";
		items = clone;
	}
</script>

<button on:click={update} >Update</button>

<ul>
	{#each items as item (item.id)}
		<li>{item.value}</li>
	{/each}
</ul>

