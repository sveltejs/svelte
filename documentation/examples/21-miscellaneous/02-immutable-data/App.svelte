<script>
	import ImmutableTodo from './ImmutableTodo.svelte';
	import MutableTodo from './MutableTodo.svelte';

	let todos = [
		{ id: 1, done: true, text: 'wash the car' },
		{ id: 2, done: false, text: 'take the dog for a walk' },
		{ id: 3, done: false, text: 'mow the lawn' }
	];

	function toggle(id) {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				// return a new object
				return {
					id,
					done: !todo.done,
					text: todo.text
				};
			}

			// return the same object
			return todo;
		});
	}
</script>

<h2>Immutable</h2>
{#each todos as todo}
	<ImmutableTodo {todo} on:click={() => toggle(todo.id)} /><br />
{/each}

<h2>Mutable</h2>
{#each todos as todo}
	<MutableTodo {todo} on:click={() => toggle(todo.id)} /><br />
{/each}
