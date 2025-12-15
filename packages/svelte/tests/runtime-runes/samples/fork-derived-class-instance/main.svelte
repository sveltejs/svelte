<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(false);
</script>

<button onclick={() => {
	const f = fork(() => {
		x = true;
	});
	f.commit();
}}>fork</button>

{#if x}
	<Child />
{/if}
