<script>
	const todos = [
		{
			description: "Buy some milk",
			done: true
		},
		{
			description: "Do the laundry",
			done: true
		},
		{
			description: "Find life's true purpose",
			done: false
		}
	];
</script>

<style>
	input[type="text"] {
		width: 20em;
		max-width: calc(100% - 2em);
	}

	.done {
		opacity: 0.6;
	}
</style>

{#each todos as todo}
	<div class="todo {todo.done ? 'done': ''}">
		<input type=checkbox bind:checked={todo.done}>
		<input type=text bind:value={todo.description}>
	</div>
{/each}