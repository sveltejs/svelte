<script>
	import { fade } from 'svelte/transition';
	import Child from './Child.svelte';

	let show = $state(true);
	let value = $state(0);
	let doubled = $derived(value * 2);
</script>

<button onclick={() => (show = false)}>hide</button>
<button onclick={() => (value = 1)}>change</button>

{#if show}
	<div out:fade={{ duration: 100 }}>
		<Child label="first" read={() => [show, value, doubled]} />
	</div>
{/if}

{#if show}
	<div out:fade={{ duration: 200 }}>
		<Child label="second" read={() => [show, value, doubled]} />
	</div>
{/if}
