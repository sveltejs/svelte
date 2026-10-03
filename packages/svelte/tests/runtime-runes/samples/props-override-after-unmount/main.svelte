<script>
	import Child from './Child.svelte';

	let text = $state('a');
	let open = $state(true);
	let set_value;
</script>

<button onclick={() => (open = false)}>close</button>
<button onclick={() => (text = 'b')}>change</button>
<button onclick={() => set_value('c')}>set</button>

{#if open}
	<Child value={text} register={(fn) => (set_value = fn)} />
{/if}
