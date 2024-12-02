<script>
	import { SvelteSet } from 'svelte/reactivity';
	const set = new SvelteSet();
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
