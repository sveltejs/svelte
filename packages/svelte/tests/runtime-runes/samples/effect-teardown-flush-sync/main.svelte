<script>
	import { flushSync } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(true);
	let b = $state(0);

	$effect.pre(() => {
		console.log(`effect ${b}`);
	});
</script>

<button onclick={() => (show = false)}>hide</button>
<p>{b}</p>

{#if show}
	<Child
		onteardown={() => {
			b = 1;
			flushSync();
			console.log(`after flush ${b}`);
		}}
	/>
{/if}
