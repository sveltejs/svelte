<script>
	export let selected;
	export let tasks;
</script>

<select bind:value={selected}>
	{#each tasks as task}
		<option value='{task}'>{task.description}</option>
	{/each}
</select>

<label>
	<input type='checkbox' bind:checked={selected.done}> {selected.description}
</label>

<h2>Pending tasks</h2>
{#each tasks.filter(t => !t.done) as task}
	<p>{task.description}</p>
{/each}