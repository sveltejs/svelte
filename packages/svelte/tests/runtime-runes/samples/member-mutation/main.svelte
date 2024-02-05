<script>
	let people = $state([{name:{first:'rob'}}]);
</script>

{#each people as person}
	<button on:click={()=>{
		person.name.first = "dave";
		people = people;
	}}>person.name.first = "dave"</button>
{/each}

<h3>JSON output</h3>
{#each people as person}
	<div>{JSON.stringify(people)}</div>
{/each}
