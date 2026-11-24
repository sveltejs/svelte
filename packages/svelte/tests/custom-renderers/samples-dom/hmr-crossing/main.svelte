<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';

	let message = $state('hello');

	// see `_config.js`
	globalThis.__record_hmr_wrappers?.('main');
</script>

<button onclick={() => (message += '!')}>update</button>
<Child {message}></Child>
