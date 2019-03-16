<script>
	let todos = [
		{ done: false, text: 'one' },
		{ done: false, text: 'two' },
		{ done: false, text: 'three' }
	];

	export function clear() {
		todos = todos.filter(t => !t.done);
	}
</script>

{#each todos as todo, i}
	<div>
		<input type=checkbox bind:checked={todo.done}>
		<p>{todo.text}</p>
	</div>
{/each}