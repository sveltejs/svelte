<script>
	import Parent from "./Parent.svelte";
	export let selected;
	export let tasks = ['do nothing'];
	export let tasks_touched = 0;

	$: {
		tasks, tasks_touched++;
	}
</script>

<Parent let:tasks={tasks}>
	<select bind:value={selected}>
		{#each tasks as task}
			<option value={task}>{task}</option>
		{/each}
	</select>
</Parent>
<p>{tasks_touched}</p>
