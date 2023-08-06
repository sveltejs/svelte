<script>
	import ImmutableTodo from './ImmutableTodo.svelte';
	import MutableTodo from './MutableTodo.svelte';

	let todos = [
		{ id: 1, done: true, text: 'laver la voiture' },
		{ id: 2, done: false, text: 'sortir le chien' },
		{ id: 3, done: false, text: 'tondre la pelouse' }
	];

	function toggle(id) {
		todos = todos.map((todo) => {
			if (todo.id === id) {
				// renvoie un nouvel objet
				return {
					id,
					done: !todo.done,
					text: todo.text
				};
			}

			// renvoie le même objet
			return todo;
		});
	}
</script>

<h2>Immutable</h2>
{#each todos as todo}
	<ImmutableTodo {todo} on:click={() => toggle(todo.id)} />
{/each}

<h2>Mutable</h2>
{#each todos as todo}
	<MutableTodo {todo} on:click={() => toggle(todo.id)} />
{/each}
