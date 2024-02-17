<script>
	import Component from './Component.svelte';

	let items = $state(['hello', 'world', 'bye']);
</script>

{#each items as item}
	<Component {item} />
{/each}

<button onclick={() => (items[1] = null)}> set null </button>
<button onclick={() => (items[1] = 'hello')}> set object </button>
