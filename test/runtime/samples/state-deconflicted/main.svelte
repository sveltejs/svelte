<script>
	export let state;
	export let states;
</script>

<p>Current state: {state}</p>

<ul>
	{#each states as state}
		<li>{state}</li>
	{/each}
</ul>