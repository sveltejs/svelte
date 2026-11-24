<svelte:options customRenderer={null} />

<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	setContext('message', 'from the DOM');
</script>

<div><Child></Child></div>
