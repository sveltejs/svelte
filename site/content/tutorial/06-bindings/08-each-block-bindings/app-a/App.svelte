<script>
	let todos = [
		{ done: false, text: 'finish Svelte tutorial' },
		{ done: false, text: 'build an app' },
		{ done: false, text: 'world domination' }
	];

	function add() {
		todos = todos.concat({ done: false, text: '' });
	}

	function clear() {
		todos = todos.filter(t => !t.done);
	}
</script>

<h1>Todos</h1>

{#each todos as todo}
	<div>
		<input
			type=checkbox
			checked={todo.done}
		>

		<input
			placeholder="What needs to be done?"
			value={todo.text}
		>
	</div>
{/each}

<button on:click={add}>
	Add new
</button>

<button on:click={clear}>
	Clear completed
</button>
