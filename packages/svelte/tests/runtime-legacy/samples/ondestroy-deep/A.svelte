<script>
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';
	import B from './B.svelte';

	let yes = 1;

	onDestroy(() => destroyed.push('A'));
</script>

<div>
	{#if yes}
		<B/>
	{/if}
</div>