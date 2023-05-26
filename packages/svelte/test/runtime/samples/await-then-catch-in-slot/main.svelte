<script>
	import Foo from './Foo.svelte';

	export let thePromise;
</script>

<Foo>
	{#await thePromise}
		<p>loading...</p>
	{:then theValue}
		<p>the value is {theValue}</p>
	{:catch theError}
		<p>oh no! {theError.message}</p>
	{/await}
</Foo>