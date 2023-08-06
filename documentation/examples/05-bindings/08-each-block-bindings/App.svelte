<script>
	let todos = [
		{ done: false, text: 'finir le tutoriel Svelte' },
		{ done: false, text: 'construire une app' },
		{ done: false, text: 'dominer le monde' }
	];

	function add() {
		todos = todos.concat({ done: false, text: '' });
	}

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

	$: remaining = todos.filter((t) => !t.done).length;
</script>

<h1>Todos</h1>

{#each todos as todo}
	<div>
		<input type="checkbox" bind:checked={todo.done} />

		<input
			placeholder="Qu'avez-vous besoin de faire ?"
			bind:value={todo.text}
			disabled={todo.done}
		/>
	</div>
{/each}

<p>Encore {remaining}</p>

<button on:click={add}> Ajouter </button>

<button on:click={clear}> Effacer les tâches complétées </button>
