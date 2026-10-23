<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let show = $state(false);

	/** @type {ReturnType<typeof fork> | null} */
	let f = null;
</script>

<button
	onclick={() =>
		(f = fork(() => {
			show = true;
			count = 1;
		}))}>fork</button
>
<button onclick={() => f?.commit()}>commit</button>

{#if show}
	<Child {count} />
{/if}
