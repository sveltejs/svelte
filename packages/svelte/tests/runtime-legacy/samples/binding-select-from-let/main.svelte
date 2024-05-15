<script>
	import Parent from "./Parent.svelte";
	export let selected;
</script>

<Parent let:tasks={tasks}>
	<select bind:value={selected}>
		{#each tasks as task}
			<option value={task}>{task}</option>
		{/each}
	</select>
</Parent>
