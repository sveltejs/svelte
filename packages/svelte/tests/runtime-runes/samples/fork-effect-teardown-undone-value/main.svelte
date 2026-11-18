<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(0);
	let show = $state(false);

	/** @type {import('svelte').Fork | null} */
	let f = null;
</script>

<button onclick={() => (f = fork(() => (x = 1)))}>fork</button>
<button onclick={() => (show = true)}>show</button>
<button onclick={() => f?.commit()}>commit</button>

{#if show && x === 0}
	<Child getX={() => x} />
{/if}
