<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => {
	let f = fork(() => {
		show = !show;
	});
	f.discard();
}}>fork</button>

{#if show}
	hi
{:else}
	{#if show || !show}
		<Child />
	{/if}
{/if}
