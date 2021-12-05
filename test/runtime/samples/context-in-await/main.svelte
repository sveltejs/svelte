<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	setContext('test', 123);

	export let promise = Promise.resolve();
</script>

{#await promise}
	<p>...waiting</p>
{:then}
	<Child />
{/await}