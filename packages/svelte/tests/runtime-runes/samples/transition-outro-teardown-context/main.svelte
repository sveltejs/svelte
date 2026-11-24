<script>
	import { fade } from 'svelte/transition';
	import Child from './Child.svelte';
	let show = $state(true);
</script>

<button onclick={() => (show = false)}>hide</button>

{#if show}
	<div out:fade={{ duration: 100 }}>
		<Child {show} />
	</div>
{/if}
