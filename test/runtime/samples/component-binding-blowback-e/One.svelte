<script>
	import Two from './Two.svelte';

	export let list;

	function handle_click() {
		list = [...list, {}];
	}
</script>

{#each list as item}
	<Two bind:value={item.value}/>
{/each}

<button on:click={handle_click}>
	click me
</button>