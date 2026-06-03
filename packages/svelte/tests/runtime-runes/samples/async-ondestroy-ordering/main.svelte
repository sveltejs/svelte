<script lang="ts">
	import { onDestroy } from 'svelte';
	import { destroyed } from './destroyed.js';
	import A from './A.svelte';
	import B from './B.svelte';

	onDestroy(() => destroyed.push('root'));
</script>

{#if await Promise.resolve(true)}
	<A/>
{/if}
<B/>