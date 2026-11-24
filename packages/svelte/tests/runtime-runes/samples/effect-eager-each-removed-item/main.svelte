<script>
	import Writer from './Writer.svelte';
	import Item from './Item.svelte';
	let go = $state(false);
	let items = $state([{ name: 'a' }]);
</script>

<button onclick={() => (go = true)}>go</button>
<Writer {go} clear={() => (items = [])} />
{#each items as item, i}
	<Item {go} get={() => items[i].name} />
{/each}
