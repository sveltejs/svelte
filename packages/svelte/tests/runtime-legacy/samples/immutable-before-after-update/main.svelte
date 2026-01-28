<script>
	import ImmutableTodo from './ImmutableTodo.svelte';

	let todos = [
		{ id: 1, done: false },
		{ id: 2, done: false },
		{ id: 3, done: false }
	];

	function toggle(id) {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				return {
					id,
					done: !todo.done
				};
			}

			return todo;
		});
	}
</script>

{#each todos as todo}
	<ImmutableTodo {todo} on:click={() => toggle(todo.id)} />
{/each}
