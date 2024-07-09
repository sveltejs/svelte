<script>
	import ComponentA from './ComponentA.svelte';
	import ComponentB from './ComponentB.svelte';

	let type = $state(ComponentA);
	let elem = $state.frozen();

	$effect(() => {
		console.log(elem);
	});
</script>

<button
	onclick={() => {
		type = ComponentA;
	}}>a</button
>
<button
	onclick={() => {
		type = ComponentB;
	}}>b</button
>

<svelte:component this={type} bind:this={elem}>Content</svelte:component>
