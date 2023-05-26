<script>
	import Two from './Two.svelte';

	export let list;
	export let i;

	function handle_click() {
		list = [...list, {}];
	}
</script>

{#each list as item, j}
	<Two bind:value={item.value} {i} {j}/>
{/each}

<button on:click={handle_click}>
	click me
</button>