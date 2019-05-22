<!-- https://eugenkiss.github.io/7guis/tasks#crud -->

<script>
	let people = [
		{
			first: 'Hans',
			last: 'Emil'
		},
		{
			first: 'Max',
			last: 'Mustermann'
		},
		{
			first: 'Roman',
			last: 'Tisch'
		}
	];

	let query = '';
	let i = 0;

	$: filteredPeople = query ? people.filter(person => {
			const name = `${person.first} ${person.last}`;
			return name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
		}) : people;

	$: selected = filteredPeople[i] ? filteredPeople[i] : { first: '', last: '' };

	function create() {
		people = people.concat({ first: "PLACE", last: "HODL"});
		i = people.length - 1;
	}

	function remove() {
		people = [...people.slice(0, i), ...people.slice(i + 1)];
		i = Math.min(i, people.length - 1);
	}
</script>

<style>
	* {
		font-family: inherit;
		font-size: inherit;
	}

	input {
		display: block;
		margin: 0 0 0.5em 0;
	}

	select {
		float: left;
		margin: 0 1em 1em 0;
		width: 10em;
		font-size: 1.618em;
	}

	.buttons {
		clear: both;
	}
</style>

<select bind:value={i}>
	{#each filteredPeople as person, i}
		<option value={i}>{person.first} {person.last}</option>
	{/each}
</select>

<p>
	<br />
	<br />
</p>

<input placeholder="search" bind:value={query}>

<br />
<label><input bind:value={selected.first} placeholder="first"></label>
<label><input bind:value={selected.last} placeholder="last"></label>
<br />

<div class='buttons'>
	<button on:click={create}>create</button>
	<button on:click={remove} disabled="{!selected}">delete</button>
</div>
