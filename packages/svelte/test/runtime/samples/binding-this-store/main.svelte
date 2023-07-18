<script>
	import { writable } from 'svelte/store';
	const foo = writable();
</script>

<div bind:this={$foo}>{typeof $foo}</div>
