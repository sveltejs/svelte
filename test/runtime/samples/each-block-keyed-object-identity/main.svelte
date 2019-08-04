<script>
	export let todos;
</script>

{#each todos as todo, i (todo)}
	<p>{i+1}: {todo.description}</p>
{/each}
