<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let visible = $state(true);

	export function hide() {
		visible = false;
	}
	export function show() {
		visible = true;
	}
</script>

<div>
	{#if visible}
		<Child message="hello from child"></Child>
	{/if}
</div>
