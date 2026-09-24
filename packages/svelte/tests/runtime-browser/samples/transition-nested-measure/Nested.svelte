<script>
	import Nested from './Nested.svelte';
	import { slide } from 'svelte/transition';

	let { depth } = $props();
</script>

<div class="level-{depth}" in:slide|global={{ duration: 100 }}>
	{#if depth > 0}
		<Nested depth={depth - 1} />
	{:else}
		<div style="height: 100px">leaf</div>
	{/if}
</div>
