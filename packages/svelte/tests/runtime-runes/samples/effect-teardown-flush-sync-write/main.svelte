<script>
	import { flushSync } from 'svelte';
	import Child from './Child.svelte';

	let show = $state(true);
	let x = $state(0);
	let y = $state(0);

	$effect.pre(() => {
		if (y) x = 2;
	});
</script>

<button
	onclick={() => {
		show = false;
		x = 1;
	}}>hide</button
>
<p>{x} {y}</p>

{#if show}
	<Child
		onteardown={() => {
			console.log(`before ${x}`);
			y = 1;
			flushSync();
			console.log(`after ${x}`);
		}}
	/>
{/if}
