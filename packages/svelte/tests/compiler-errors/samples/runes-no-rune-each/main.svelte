<script>
	let todos = $state([]);
</script>


{#each todos as $state(todo)}
  {todo}
{/each}