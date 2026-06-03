<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';
	let x = $state('world');
</script>

<button onclick={async () => {
	const f = fork(() => {
		x = 'universe'
	});
	await new Promise(r => setTimeout(r));
	f.commit();
}}>fork</button>

{#if x === 'universe'}
	<Child {x} />
{/if}
