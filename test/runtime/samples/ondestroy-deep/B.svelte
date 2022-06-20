<script>
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';
	import C from './C.svelte';

	let yes = 1;

	onDestroy(() => destroyed.push('B'));
</script>

<div>
	{#if yes}
		<C/>
	{/if}
</div>