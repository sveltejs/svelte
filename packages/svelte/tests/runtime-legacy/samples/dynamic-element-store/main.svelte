<script>
	import { writable } from 'svelte/store';
	const foo = writable('div');
</script>

<svelte:element this={$foo}></svelte:element>
