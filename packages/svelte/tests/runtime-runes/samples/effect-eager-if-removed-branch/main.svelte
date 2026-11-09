<script>
	import Writer from './Writer.svelte';
	import Item from './Item.svelte';
	let go = $state(false);
	let obj = $state({ name: 'a' });
</script>

<button onclick={() => (go = true)}>go</button>
<Writer {go} clear={() => (obj = null)} />
{#if obj}
	<Item {go} get={() => obj.name} />
{/if}
