<script>
	let promise = new Promise(resolve => resolve(10));
</script>

{#each {length: 3} as _, i}
	<slot item={i}/>
{/each}

{#await promise then value}
	<slot {value}/>
{/await}
