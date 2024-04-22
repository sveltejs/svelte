<script>
	import { Set } from 'svelte/reactivity';
	const set = new Set();
</script>

<form onsubmit={e => {
	e.preventDefault();
	const data = new FormData(e.target);
	const state = $state({ name: data.get('name') });
	set.add(state);
	e.target.reset();
}}>
	<input name="name" />
	<button>Add</button>
</form>

{#each set as item}
	<div>{item.name}</div>
{/each}
