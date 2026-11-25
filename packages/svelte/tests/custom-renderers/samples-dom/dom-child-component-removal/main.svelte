<script>
	import Child from './Child.svelte';

	let visible = $state(true);

	export function toggle() {
		visible = !visible;
	}
</script>

<custom>
	{#if visible}
		<Child message="hello"></Child>
	{/if}
	<after></after>
</custom>
