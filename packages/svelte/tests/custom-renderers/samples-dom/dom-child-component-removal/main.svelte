<script>
	import Child from './Child.svelte';

	let visible = $state(true);

	export function hide() {
		visible = false;
	}
</script>

<custom>
	{#if visible}
		<Child message="hello from child"></Child>
	{/if}
</custom>
