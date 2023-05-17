<script>
	export let todos;
</script>

{#each todos as todo}
	<label>
		<input type=checkbox on:change={e => todo.update(t => ({ done: e.target.checked, text: t.text }))}>
		{$todo.done ? '[done]' : '[todo]'} {$todo.text}
	</label>
{/each}