<script>
	export let todos;
</script>

{#each todos as todo (todo.id)}
	<p>{todo.description}</p>
{/each}
