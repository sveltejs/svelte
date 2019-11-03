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

	let prefix = '';
	let first = '';
	let last = '';
	let i = 0;

	$: filteredPeople = prefix
		? people.map(person => {
			const name = `${person.last}, ${person.first}`;
			return { matched: name.toLowerCase().startsWith(prefix.toLowerCase()), person: person };
		})
		: people.map(person => Object({ matched: true, person: person }));

	$: if (!filteredPeople[i].matched) {
		let newIndex = filteredPeople.findIndex(person => person.matched);
		if (newIndex >= 0) i = newIndex;
	}

	$: selected = filteredPeople[i].person;

	$: reset_inputs(selected);

	function create() {
		people = people.concat({ first, last });
		i = people.length - 1;
		first = last = '';
	}

	function update() {
		people[i] = { first, last };
	}

	function remove() {
		// Remove selected person from the source array (people), not the filtered array
		const index = people.indexOf(selected);
		people = [...people.slice(0, index), ...people.slice(index + 1)];

		first = last = '';
		i = Math.min(i, filteredPeople.length - 2);
	}

	function reset_inputs(person) {
		first = person ? person.first : '';
		last = person ? person.last : '';
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
		width: 14em;
	}

	.buttons {
		clear: both;
	}
</style>

<input placeholder="filter prefix" bind:value={prefix}>

<select bind:value={i} size={5}>
	{#each filteredPeople as { matched, person }, i}
		{#if matched}
		<option value={i}>{person.last}, {person.first}</option>
		{/if}
	{/each}
</select>

<label><input bind:value={first} placeholder="first"></label>
<label><input bind:value={last} placeholder="last"></label>

<div class='buttons'>
	<button on:click={create} disabled="{!first || !last}">create</button>
	<button on:click={update} disabled="{!first || !last || !selected}">update</button>
	<button on:click={remove} disabled="{!selected}">delete</button>
</div>
