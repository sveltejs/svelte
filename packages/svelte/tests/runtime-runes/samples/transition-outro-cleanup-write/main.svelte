<script>
	import { fade } from 'svelte/transition';
	import Child from './Child.svelte';
	let show = $state(true);
	let count = $state(0);
</script>

<button onclick={() => (show = false)}>hide</button>
<output>{count}</output>

{#if show}
	<div out:fade={{ duration: 100 }}>
		<Child cleanup={() => count++} />
	</div>
{/if}
