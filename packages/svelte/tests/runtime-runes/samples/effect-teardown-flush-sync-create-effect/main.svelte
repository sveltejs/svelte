<script>
	import { flushSync } from 'svelte';
	import Child from './Child.svelte';
	import Inner from './Inner.svelte';

	let show = $state(true);
	let open = $state(false);
</script>

<button onclick={() => (show = false)}>hide</button>

{#if show}
	<Child
		onteardown={() => {
			open = true;
			flushSync();
			console.log('after flush');
		}}
	/>
{/if}

{#if open}
	<Inner />
{/if}
